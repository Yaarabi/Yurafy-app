import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Template from "@/models/templates";
import WhatsAppAccount from "@/models/whatsappAccount";
import WhatsAppConversation from "@/models/whatsappMessage";
import { decryptToken } from "../webhook/route";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";
import { sendTemplateMessage } from "@/lib/whatsapp/sendTemplate";

/**
 * POST /api/whatsapp/btns-handler
 * 
 * Handles button click payloads from WhatsApp webhook.
 * Checks if the payload matches any active detection rule keywords,
 * and sends the corresponding template if a match is found.
 * 
 * Expected body:
 * {
 *   accountId: string,          // WhatsApp account _id
 *   customerPhone: string,       // E.164 phone number
 *   buttonPayload: string        // e.g., "order_confirmation", "cancel_order", "edit_order"
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

        // 1. Get WhatsApp account
        const account = await WhatsAppAccount.findById(accountId);
        if (!account || account.status !== "connected") {
            return NextResponse.json(
                { error: "WhatsApp account not found or disconnected" },
                { status: 404 }
            );
        }

        // 2. Check if button payload matches any active detection rule keyword
        const matchingRule = account.detectionRules?.find(
            (rule: any) =>
                rule.active &&
                Array.isArray(rule.keywords) &&
                rule.keywords.includes(buttonPayload)
        );

        if (!matchingRule) {
            console.log(`[btns-handler] No active detection rule found for payload: ${buttonPayload}`);
            return NextResponse.json({
                success: true,
                message: "No matching detection rule",
                action: "ignored"
            });
        }

        // 3. Get the template specified in the matching rule
        const templateName = matchingRule.template;
        if (!templateName) {
            console.log(`[btns-handler] Detection rule matched but no template specified`);
            return NextResponse.json({
                success: true,
                message: "No template configured for this rule",
                action: "ignored"
            });
        }

        const template = await Template.findOne({
            owner: account.owner,
            name: templateName,
            // status: "APPROVED" || "PENDING"
        });

        if (!template) {
            console.log(`[btns-handler] Template "${templateName}" not found or not approved`);
            return NextResponse.json(
                { error: `Template "${templateName}" not found or not approved` },
                { status: 404 }
            );
        }

        // 4. Normalize phone and get conversation context
        const phone = normalizePhoneNumber(customerPhone);
        const token = decryptToken(account.waTokenEncrypted);

        // Get conversation for additional context (optional)
        const conversation = await WhatsAppConversation.findOne({
            owner: account.owner,
            "customer.phone": phone
        });

        // 5. Prepare variable values (basic phone-only context for button responses)
        const variableValues: string[] = [];
        if (template.variables && template.variables.length > 0) {
            for (const varName of template.variables) {
                const key = varName.toLowerCase();
                let value = "";
                
                // Map available data
                if (key === "phone") {
                    value = phone;
                } else if (key === "fullname" && conversation?.customer?.name) {
                    value = conversation.customer.name;
                }
                // Add more mappings as needed
                
                variableValues.push(value);
            }
        }

        // 6. Build button URL parameters if template has URL buttons
        const { buildButtonUrlParameters } = await import("@/lib/whatsapp/templateUtils");
        const buttonParamSets = buildButtonUrlParameters(template, undefined, phone);

        // 7. Send the template message
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

        // 8. Log the button interaction
        await WhatsAppConversation.findOneAndUpdate(
            { owner: account.owner, "customer.phone": phone },
            {
                $push: {
                    messages: {
                        from: phone,
                        to: account.waNumber,
                        type: "button",
                        text: `Button clicked: ${buttonPayload}`,
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

        console.log(`[btns-handler] Successfully handled button "${buttonPayload}" for ${phone}, sent template "${templateName}"`);

        return NextResponse.json({
            success: true,
            action: "template_sent",
            buttonPayload,
            templateName,
            rule: matchingRule.template
        });

    } catch (error: any) {
        console.error("[btns-handler] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
