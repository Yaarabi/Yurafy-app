// app/api/whatsapp/send-ads/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";
import Template from "@/models/templates";
import WhatsAppAccount, { IWhatsAppAccount } from "@/models/whatsappAccount";
import { sendWhatsAppMessageRoute } from "@/lib/whatsapp/whatsappFunction";
import { decryptToken } from "../webhook/route";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { fillTemplate } from "@/lib/whatsapp/templateVar"; 

export async function POST(req: Request) {
    try {
        const { orders: orderIds } = await req.json();
        if (!orderIds?.length) {
            return NextResponse.json({ error: "No orders provided" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ownerId = session.user.id;
        await connectDB();

        // Fetch orders
        const orderDocs = await Order.find({ _id: { $in: orderIds }, owner: ownerId });
        if (!orderDocs.length) {
            return NextResponse.json({ error: "Orders not found" }, { status: 404 });
        }

        // Fetch WhatsApp account
        const waAccount: IWhatsAppAccount | null = await WhatsAppAccount.findOne({ owner: ownerId });
        if (!waAccount) {
            return NextResponse.json({ error: "WhatsApp account not found" }, { status: 404 });
        }

        if (waAccount.status !== "connected") {
            return NextResponse.json({ error: "WhatsApp account not connected" }, { status: 400 });
        }

        if (!waAccount.settings?.ad) {
            return NextResponse.json({ error: "Ad sending is disabled" }, { status: 400 });
        }

        const adTemplateName = waAccount.preferredTemplates?.ad;
        if (!adTemplateName) {
            return NextResponse.json({ error: "No ad template selected in account" }, { status: 400 });
        }

        const template = await Template.findOne({
            owner: ownerId,
            name: adTemplateName
            // status: "APPROVED",
        });

        if (!template) {
            return NextResponse.json({ error: "Ad template not found or not approved" }, { status: 404 });
        }

        const token = decryptToken(waAccount.waTokenEncrypted);

        // Send ad message for each order
        for (const order of orderDocs) {
            const phone = order.shippingAddress.phone;
            if (!phone) continue;

            // ✅ Use imported fillTemplate function
            const messageText = fillTemplate(template.content, order);

            await sendWhatsAppMessageRoute(waAccount, phone, messageText, token);

            // Delay between messages
            await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Send ad template error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
