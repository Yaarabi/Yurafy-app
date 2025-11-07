// app/api/whatsapp/send-confirmations/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";
import Template from "@/models/templates";
import WhatsAppAccount, { IWhatsAppAccount } from "@/models/whatsappAccount";   
import { sendTemplateMessage } from "@/lib/whatsapp/sendTemplate";
import { decryptToken } from "../webhook/route";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { fillTemplate, VARIABLES } from "@/lib/whatsapp/templateVar";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";
import WhatsAppConversation from "@/models/whatsappMessage";

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

        // Check template status - only send if approved
        if (template.status !== "APPROVED") {
            return NextResponse.json({ 
                error: `Template "${templateName}" is not approved. Status: ${template.status}` 
            }, { status: 400 });
        }

        const token = decryptToken(waAccount.waTokenEncrypted);

        // Send messages sequentially using template API
        const results = [];
        for (const order of orderDocs) {
            const rawPhone = order.shippingAddress.phone;
            if (!rawPhone) {
                results.push({ orderId: order._id, phone: null, status: "skipped", reason: "No phone number" });
                continue;
            }

            // Normalize phone number to E.164 format
            const customerPhone = normalizePhoneNumber(rawPhone);

            try {
                // Extract variable values from order
                const variableValues: string[] = [];
                if (template.variables && template.variables.length > 0) {
                    for (const varName of template.variables) {
                        let value = "";
                        
                        // Map template variable names to order fields
                        switch (varName.toLowerCase()) {
                            case "fullname":
                                value = order.shippingAddress.fullName || "";
                                break;
                            case "email":
                                value = order.shippingAddress.email || "";
                                break;
                            case "phone":
                                value = order.shippingAddress.phone || "";
                                break;
                            case "address":
                                value = order.shippingAddress.address || "";
                                break;
                            case "city":
                                value = order.shippingAddress.city || "";
                                break;
                            case "country":
                                value = order.shippingAddress.country || "";
                                break;
                            case "totalamount":
                                value = String(order.totalAmount || "");
                                break;
                            case "product.name":
                                value = order.products[0]?.name || "";
                                break;
                            case "product.quantity":
                                value = String(order.products[0]?.quantity || "");
                                break;
                            case "product.price":
                                value = String(order.products[0]?.price || "");
                                break;
                            default:
                                value = "";
                        }
                        variableValues.push(value);
                    }
                }

                // Send as template message (works outside 24h window)
                await sendTemplateMessage(
                    waAccount,
                    customerPhone,
                    template,
                    variableValues,
                    token
                );

                // Track order confirmation sent
                await WhatsAppConversation.findOneAndUpdate(
                    { owner: ownerId, "customer.phone": customerPhone },
                    {
                        $set: {
                            "metadata.orderConfirmationSent": true,
                            "metadata.orderConfirmationSentAt": new Date(),
                        },
                    },
                    { upsert: true }
                );

                results.push({ orderId: order._id, phone: customerPhone, status: "sent" });

                // Delay to avoid rate limits
                await new Promise((r) => setTimeout(r, 700 + Math.random() * 800)); 
            } catch (err: any) {
                console.error(`[send-confirmations] Error sending to ${customerPhone}:`, err);
                results.push({ 
                    orderId: order._id, 
                    phone: customerPhone, 
                    status: "failed", 
                    error: err.message 
                });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (err: any) {
        console.error("Send confirmations error:", err);
        return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 }); 
    }
}
