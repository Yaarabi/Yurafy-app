import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Template from "@/models/templates";
import WhatsAppAccount from "@/models/whatsappAccount";
import WhatsAppConversation from "@/models/whatsappMessage";
import { decryptToken } from "../webhook/route";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";
import { sendTemplateMessage } from "@/lib/whatsapp/sendTemplate";

// Map button actions to order statuses and notification messages
const ACTION_CONFIG: Record<string, { status?: string; notifTitle: string; notifMessage: (name: string) => string }> = {
    "order_confirmation": {
        status: "confirmed",
        notifTitle: "Order Confirmed",
        notifMessage: (name: string) => `Customer ${name} confirmed their order.`
    },
    "cancel_order": {
        status: "cancelled",
        notifTitle: "Order Cancelled",
        notifMessage: (name: string) => `Customer ${name} cancelled their order.`
    },
    "edit_order": {
        notifTitle: "Order Edit Requested",
        notifMessage: (name: string) => `Customer ${name} requested to edit their order.`
    }
};

// Helper to get base URL for internal API calls
function getBaseUrl() {
    return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

/**
 * POST /api/whatsapp/btns-handler
 * 
 * Handles button click payloads from WhatsApp webhook.
 * Supports payloads with order ID: "action|orderId" format
 * Example: "order_confirmation|507f1f77bcf86cd799439011"
 * 
 * Expected body:
 * {
 *   accountId: string,          // WhatsApp account _id
 *   customerPhone: string,       // E.164 phone number
 *   buttonPayload: string        // e.g., "order_confirmation|orderId", "cancel_order|orderId"
 * }
 */
export async function POST(req: Request) {
    try {
        const { accountId, customerPhone, buttonPayload } = await req.json();

        if (!accountId || !customerPhone || !buttonPayload) {
            return NextResponse.json(
                { error: "Missing required fields: accountId, customerPhone, buttonPayload" },
                { status: 400 }
            );
        }

        await connectDB();

        // Parse payload - supports "action|orderId" format
        const [action, payloadOrderId] = buttonPayload.split("|");
        let orderId = payloadOrderId;
        let hasOrderId = orderId && /^[0-9a-fA-F]{24}$/.test(orderId);

        // 1. Get WhatsApp account
        const account = await WhatsAppAccount.findById(accountId);
        if (!account || account.status !== "connected") {
            return NextResponse.json(
                { error: "WhatsApp account not found or disconnected" },
                { status: 404 }
            );
        }

        const ownerId = account.owner.toString();

        // Normalize phone for lookup
        const phone = normalizePhoneNumber(customerPhone);

        // 2. If no orderId in payload, check conversation metadata for pending order
        let conversation = await WhatsAppConversation.findOne({
            owner: account.owner,
            "customer.phone": phone
        });

        console.log(`[btns-handler] Conversation found: ${!!conversation}, metadata: ${JSON.stringify(conversation?.metadata || {})}`);
        
        if (!hasOrderId && conversation?.metadata?.pendingOrderId) {
            orderId = conversation.metadata.pendingOrderId.toString();
            hasOrderId = true;
            console.log(`[btns-handler] Using pending orderId from conversation: ${orderId}`);
        }

        console.log(`[btns-handler] Payload: ${buttonPayload}, Action: ${action}, OrderId: ${orderId || "none"}, hasOrderId: ${hasOrderId}`);

        // Get customer name from conversation or default to phone
        const customerName = conversation?.customer?.name || phone;

        // 3. Update order status via API if orderId is present and action has status
        let orderUpdated = false;
        let updatedOrderData: any = null;
        const actionConfig = ACTION_CONFIG[action];
        const baseUrl = getBaseUrl();
        
        if (hasOrderId && actionConfig?.status) {
            try {
                const statusResponse = await fetch(`${baseUrl}/api/orders/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: orderId,
                        status: actionConfig.status,
                        ownerId: ownerId
                    })
                });

                const statusResult = await statusResponse.json();
                
                if (statusResponse.ok && statusResult.order) {
                    orderUpdated = true;
                    updatedOrderData = statusResult.order;
                    console.log(`[btns-handler] Order ${orderId} status updated to "${actionConfig.status}" via API`);
                    
                    // Clear pending order from conversation after handling
                    await WhatsAppConversation.findOneAndUpdate(
                        { owner: account.owner, "customer.phone": phone },
                        { $unset: { "metadata.pendingOrderId": "", "metadata.pendingOrderSentAt": "" } }
                    );
                } else {
                    console.log(`[btns-handler] Failed to update order via API:`, statusResult);
                }
            } catch (err) {
                console.error(`[btns-handler] Error calling orders/status API:`, err);
            }
        }

        // 4. Create notification via API for all button actions
        if (actionConfig) {
            const finalCustomerName = updatedOrderData?.customerName || customerName;
            
            try {
                const notifResponse = await fetch(`${baseUrl}/api/notifications/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ownerId: ownerId,
                        type: "agent",
                        title: actionConfig.notifTitle,
                        message: actionConfig.notifMessage(finalCustomerName),
                        link: hasOrderId ? `/dashboard/orders?id=${orderId}` : "/dashboard/orders",
                        metadata: {
                            action,
                            orderId: hasOrderId ? orderId : undefined,
                            customerPhone: phone,
                            customerName: finalCustomerName,
                            newStatus: actionConfig.status
                        }
                    })
                });

                if (notifResponse.ok) {
                    console.log(`[btns-handler] Notification created for action "${action}"`);
                } else {
                    const notifError = await notifResponse.json();
                    console.error(`[btns-handler] Failed to create notification:`, notifError);
                }
            } catch (err) {
                console.error(`[btns-handler] Error calling notifications/create API:`, err);
            }
        }

        // 5. Check if button action matches any active detection rule keyword
        const matchingRule = account.detectionRules?.find(
            (rule: any) =>
                rule.active &&
                Array.isArray(rule.keywords) &&
                rule.keywords.includes(action)
        );

        if (!matchingRule) {
            console.log(`[btns-handler] No active detection rule found for action: ${action}`);
            return NextResponse.json({
                success: true,
                message: orderUpdated ? "Order updated, no template rule" : "No matching detection rule",
                action: orderUpdated ? "order_updated" : "ignored",
                orderUpdated,
                orderId: hasOrderId ? orderId : undefined,
                newStatus: orderUpdated ? actionConfig?.status : undefined
            });
        }

        // 6. Get the template specified in the matching rule
        const templateName = matchingRule.template;
        if (!templateName) {
            console.log(`[btns-handler] Detection rule matched but no template specified`);
            return NextResponse.json({
                success: true,
                message: "No template configured for this rule",
                action: orderUpdated ? "order_updated" : "ignored",
                orderUpdated
            });
        }

        const template = await Template.findOne({
            owner: account.owner,
            name: templateName,
        });

        if (!template) {
            console.log(`[btns-handler] Template "${templateName}" not found`);
            return NextResponse.json(
                { error: `Template "${templateName}" not found` },
                { status: 404 }
            );
        }

        // 7. Prepare to send template
        const token = decryptToken(account.waTokenEncrypted);

        // 8. Prepare variable values
        const variableValues: string[] = [];
        if (template.variables && template.variables.length > 0) {
            for (const varName of template.variables) {
                const key = varName.toLowerCase();
                let value = "";
                
                // Map available data
                if (key === "phone") {
                    value = phone;
                } else if (key === "fullname") {
                    value = updatedOrderData?.customerName || conversation?.customer?.name || "";
                } else if (key === "orderid" && hasOrderId) {
                    value = orderId;
                } else if (key === "status" && updatedOrderData) {
                    value = updatedOrderData.status;
                }
                
                variableValues.push(value);
            }
        }

        // 9. Build button URL parameters if template has URL buttons
        const { buildButtonUrlParameters } = await import("@/lib/whatsapp/templateUtils");
        const buttonParamSets = buildButtonUrlParameters(template, updatedOrderData, phone);

        // 10. Send the template message
        const result = await sendTemplateMessage(
            account,
            phone,
            template,
            variableValues,
            token,
            buttonParamSets
        );

        if (!result.success) {
            console.error(`[btns-handler] Failed to send template:`, result.error);
            return NextResponse.json(
                { error: `Failed to send template: ${result.error}` },
                { status: 500 }
            );
        }

        // 11. Log the button interaction
        await WhatsAppConversation.findOneAndUpdate(
            { owner: account.owner, "customer.phone": phone },
            {
                $push: {
                    messages: {
                        from: phone,
                        to: account.waNumber,
                        type: "button",
                        text: `Button clicked: ${action}${hasOrderId ? ` (Order: ${orderId})` : ""}`,
                        direction: "incoming",
                        status: "received",
                        timestamp: Date.now(),
                        isAIResponse: false
                    }
                },
                $set: {
                    lastTimestamp: Date.now()
                }
            },
            { upsert: true }
        );

        console.log(`[btns-handler] Successfully handled button "${action}" for ${phone}, sent template "${templateName}"${orderUpdated ? `, order ${orderId} updated` : ""}`);

        return NextResponse.json({
            success: true,
            action: "template_sent",
            buttonPayload: action,
            templateName,
            orderUpdated,
            orderId: hasOrderId ? orderId : undefined,
            newStatus: orderUpdated ? actionConfig?.status : undefined
        });

    } catch (error: any) {
        console.error("[btns-handler] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
