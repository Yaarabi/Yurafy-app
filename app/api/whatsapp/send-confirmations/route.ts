// app/api/whatsapp/send-confirmations/route.ts
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
            return NextResponse.json({ error: "WhatsApp account is not connected" }, { status: 400 });
        }

        if (!waAccount.settings?.orderConfirmation) {
            return NextResponse.json({ error: "Order confirmation is disabled" }, { status: 400 });
        }

        // Get the template
        const templateName = waAccount.preferredTemplates?.orderConfirmation;
        const template = await Template.findOne({ owner: ownerId, name: templateName });
        if (!template) {
            return NextResponse.json({ error: "No approved order confirmation template" }, { status: 404 });
        }

        const token = decryptToken(waAccount.waTokenEncrypted);

        // Send messages sequentially
        for (const order of orderDocs) {
            const customerPhone = order.shippingAddress.phone;
            if (!customerPhone) continue;

            if (template.type === "TEXT") {
                // Use fillTemplate for TEXT templates
                const messageText = fillTemplate(template.content || "", order);
                await sendWhatsAppMessageRoute(waAccount, customerPhone, messageText, token);
            } else {
                await sendWhatsAppMessageRoute(
                    waAccount,
                    customerPhone,
                    template.caption || "",
                    token
                );
            }

            // Delay to avoid rate limits
            await new Promise((r) => setTimeout(r, 700 + Math.random() * 800));
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Send confirmations error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
