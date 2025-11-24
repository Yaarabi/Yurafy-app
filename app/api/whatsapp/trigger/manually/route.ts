import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";
import Template from "@/models/templates";
import WhatsAppAccount, { IWhatsAppAccount } from "@/models/whatsappAccount";
import OrderMessageTrigger from "@/models/orderMessageTrigger";
import { sendTemplateMessage } from "@/lib/whatsapp/sendTemplate";
import { decryptToken } from "../../webhook/route";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { fillTemplateVariables } from "@/lib/whatsapp/templateUtils";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const ownerId = session.user.id;

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        await connectDB();

        // 1. Verify Order exists and belongs to user
        const orderDoc = await Order.findOne({ _id: orderId, owner: ownerId });
        if (!orderDoc) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const currentStatus = orderDoc.status;

        // 2. Check if owner has WhatsApp account
        const waAccount: IWhatsAppAccount | null = await WhatsAppAccount.findOne({ owner: ownerId });
        if (!waAccount || waAccount.status !== "connected") {
            return NextResponse.json({ error: "No connected WhatsApp account found" }, { status: 400 });
        }

        // 3. Find active trigger for this status (Ignore 'auto' flag, as this is manual)
        const trigger = await OrderMessageTrigger.findOne({
            ownerId: ownerId,
            whatsappAccountId: waAccount._id,
            orderStatus: currentStatus,
            active: true
        });

        if (!trigger) {
            return NextResponse.json({ error: `No active trigger found for status: ${currentStatus}` }, { status: 404 });
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

        // 6. Fill variables
        const variableValues = fillTemplateVariables(template, orderDoc);

        // 7. Send Message
        await sendTemplateMessage(
            waAccount,
            customerPhone,
            template,
            variableValues,
            token
        );

        return NextResponse.json({ success: true, trigger: trigger.name, template: template.name });

    } catch (error: any) {
        console.error("Manual trigger execution error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
