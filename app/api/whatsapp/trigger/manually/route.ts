import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";
import Template from "@/models/templates";
import WhatsAppAccount, { IWhatsAppAccount } from "@/models/whatsappAccount";
import WhatsAppConversation from "@/models/whatsappMessage";
import OrderMessageTrigger from "@/models/orderMessageTrigger";
import { sendTemplateMessage } from "@/lib/whatsapp/sendTemplate";
import { decryptToken } from "../../webhook/route";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";
import { fillTemplateVariables, buildButtonUrlParameters } from "@/lib/whatsapp/templateUtils";

export async function POST(req: Request) {
    try {
        const { orderId, confirmed } = await req.json();

        if (!orderId) {
        return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        await connectDB();

        // 1. Get Order by ID
        const orderDoc = await Order.findOne({ _id: orderId });
        if (!orderDoc) {
        console.log("from order check");
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const currentStatus = orderDoc.status;

        // 2. Check if owner has WhatsApp account
        const waAccount: IWhatsAppAccount | null = await WhatsAppAccount.findOne({ owner: orderDoc.owner });
        if (!waAccount || waAccount.status !== "connected") {
        console.log("from account check");
        return NextResponse.json({ error: "No connected WhatsApp account found" }, { status: 400 });
        }

        // 3. Find active trigger for this status
        const trigger = await OrderMessageTrigger.findOne({
        ownerId: orderDoc.owner,
        whatsappAccountId: waAccount._id,
        orderStatus: currentStatus,
        active: true
        });

        if (!trigger) {
        console.log("from trigger check");
        return NextResponse.json({ error: `No active trigger found for status: ${currentStatus}` }, { status: 404 });
        }

        // 4. Get the template
        const template = await Template.findOne({ owner: orderDoc.owner, name: trigger.template });
        if (!template || template.status !== "APPROVED") {
        console.log("from template check");
        return NextResponse.json({ error: "Template not found or not approved" }, { status: 400 });
        }

        // 5. Prepare to send
        const rawPhone = orderDoc.shippingAddress?.phone;
        if (!rawPhone) {
        console.log("from phone check");
        return NextResponse.json({ error: "Order has no phone number" }, { status: 400 });
        }

        const customerPhone = normalizePhoneNumber(rawPhone);
        const token = decryptToken(waAccount.waTokenEncrypted);

        // 6. Fill variables
        const variableValues = fillTemplateVariables(template, orderDoc);

        // 7. Handle confirmation logic
        if (trigger.auto === false && !confirmed) {
        console.log("from auto check");
        return NextResponse.json({
            confirmationRequired: true,
            message: `Confirmation required to send template for status: ${currentStatus}`,
            trigger: trigger.name,
            template: template.name
        }, { status: 200 });
        }

        // 8. Send Message
        const buttonParamSets = buildButtonUrlParameters(template, orderDoc, customerPhone);
        const result = await sendTemplateMessage(
        waAccount,
        customerPhone,
        template,
        variableValues,
        token,
        buttonParamSets
        );

        if (!result.success) {
        return NextResponse.json({ error: `Failed to send message: ${result.error}` }, { status: 500 });
        }

        // Store pending order ID if template has QUICK_REPLY buttons (for button response handling)
        const hasQuickReplyButtons = template.buttons?.some((b: any) => b.type === "QUICK_REPLY");
        if (hasQuickReplyButtons) {
            const updateResult = await WhatsAppConversation.findOneAndUpdate(
                { owner: orderDoc.owner, "customer.phone": customerPhone },
                {
                    $set: {
                        "metadata.pendingOrderId": orderDoc._id,
                        "metadata.pendingOrderSentAt": new Date()
                    }
                },
                { upsert: true, new: true }
            );
            console.log(`[trigger/manually] Stored pendingOrderId ${orderDoc._id} for ${customerPhone}, updated: ${!!updateResult}`);
        }

        return NextResponse.json({ success: true, trigger: trigger.name, template: template.name });

    } catch (error: any) {
        console.error("Manual trigger execution error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
