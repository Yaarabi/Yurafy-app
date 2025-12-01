import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";
import Template from "@/models/templates";
import WhatsAppAccount, { IWhatsAppAccount } from "@/models/whatsappAccount";
import OrderMessageTrigger from "@/models/orderMessageTrigger";
import { sendTemplateMessage } from "@/lib/whatsapp/sendTemplate";
import { decryptToken } from "../webhook/route";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";
import { fillTemplateVariables, validateTemplatePlaceholders } from "@/lib/whatsapp/templateUtils";

export async function POST(req: Request) {
    try {
        const { order } = await req.json();

        if (!order || !order._id || !order.owner) {
            return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
        }

        await connectDB();

        // 1. Verify Order exists and get latest status
        const orderDoc = await Order.findById(order._id);
        if (!orderDoc) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const ownerId = orderDoc.owner;
        const currentStatus = orderDoc.status;

        // 2. Check if owner has WhatsApp account
        const waAccount: IWhatsAppAccount | null = await WhatsAppAccount.findOne({ owner: ownerId });
        if (!waAccount || waAccount.status !== "connected") {
            // Not an error for the caller, just no action needed
            return NextResponse.json({ message: "No connected WhatsApp account found", skipped: true });
        }

        // 3. Find active trigger for this status
        const trigger = await OrderMessageTrigger.findOne({
            ownerId: ownerId,
            whatsappAccountId: waAccount._id,
            orderStatus: currentStatus,
            active: true,
            auto: true
        });

        if (!trigger) {
            return NextResponse.json({ message: `No active trigger found for status: ${currentStatus}`, skipped: true });
        }

        // 4. Get the template
        const template = await Template.findOne({ owner: ownerId, name: trigger.template });
        if (!template || template.status !== "APPROVED") {
            return NextResponse.json({ error: "Template not found or not approved" }, { status: 400 });
        }

        // 5. Prepare to send
        const rawPhone = orderDoc.shippingAddress?.phone;
        if (!rawPhone) {
            return NextResponse.json({ error: "Order has no phone number" }, { status: 400 });
        }

        const customerPhone = normalizePhoneNumber(rawPhone);
        const token = decryptToken(waAccount.waTokenEncrypted);

        // 6. Validate placeholders and fill variables
        const isValid = validateTemplatePlaceholders(template);
        if (!isValid) {
            return NextResponse.json({ error: "Template placeholders must be sequential ({{1}}, {{2}}, ...) and present in content/caption." }, { status: 400 });
        }
        const variableValues = fillTemplateVariables(template, orderDoc);

        // 7. Send Message (Handle timing if needed)
        const timingSeconds = typeof trigger.timing === "number" && trigger.timing > 0 ? trigger.timing : 0;
        if (timingSeconds > 0) {
            // Wait for timingSeconds before sending
            await new Promise(resolve => setTimeout(resolve, timingSeconds * 1000));
        }
        const sendResult = await sendTemplateMessage(
            waAccount,
            customerPhone,
            template,
            variableValues,
            token
        );
        if ((sendResult as any)?.success === false) {
            return NextResponse.json({ error: (sendResult as any).error || "Failed to send template" }, { status: 502 });
        }
        return NextResponse.json({ success: true, trigger: trigger.name, template: template.name, timing: timingSeconds });

    } catch (error: any) {
        console.error("Trigger execution error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
