// app/api/whatsapp/send-ads/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";
import Template from "@/models/templates";
import WhatsAppAccount, { IWhatsAppAccount } from "@/models/whatsappAccount";   
import WhatsAppConversation from "@/models/whatsappMessage";
import { sendTemplateMessage } from "@/lib/whatsapp/sendTemplate";
import { decryptToken } from "../webhook/route";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

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
        });

        if (!template) {
            return NextResponse.json({ error: "Ad template not found" }, { status: 404 });                                                      
        }

        // Check template status - only send if approved
        if (template.status !== "APPROVED") {
            return NextResponse.json({ 
                error: `Template "${adTemplateName}" is not approved. Status: ${template.status}` 
            }, { status: 400 });
        }

        const token = decryptToken(waAccount.waTokenEncrypted);

        // Send ad message for each order
        const results = [];
        for (const order of orderDocs) {
            const phone = order.shippingAddress.phone;
            if (!phone) {
                results.push({ orderId: order._id, phone: null, status: "skipped", reason: "No phone number" });
                continue;
            }

            try {
                // Check opt-in status before sending promotional messages
                const conversation = await WhatsAppConversation.findOne({
                    owner: ownerId,
                    "customer.phone": phone
                });

                if (!conversation || conversation.optInStatus !== "opted_in") {
                    console.log(`[send-ad-template] Skipping ${phone}: User has not opted in (status: ${conversation?.optInStatus || "unknown"})`);
                    results.push({ 
                        orderId: order._id, 
                        phone: phone, 
                        status: "skipped", 
                        reason: `User not opted in (status: ${conversation?.optInStatus || "unknown"})` 
                    });
                    continue;
                }

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

                // Send as template message (works outside 24h window and for promotional messages)
                await sendTemplateMessage(
                    waAccount,
                    phone,
                    template,
                    variableValues,
                    token
                );

                // Track ad template sent
                await WhatsAppConversation.findOneAndUpdate(
                    { owner: ownerId, "customer.phone": phone },
                    {
                        $set: {
                            "metadata.adTemplateSent": true,
                            "metadata.adTemplateSentAt": new Date(),
                        },
                    },
                    { upsert: true }
                );

                results.push({ orderId: order._id, phone: phone, status: "sent" });

                // Delay between messages
                await new Promise((r) => setTimeout(r, 700 + Math.random() * 600)); 
            } catch (err: any) {
                console.error(`[send-ad-template] Error sending to ${phone}:`, err);
                results.push({ 
                    orderId: order._id, 
                    phone: phone, 
                    status: "failed", 
                    error: err.message 
                });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (err: any) {
        console.error("Send ad template error:", err);
        return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 }); 
    }
}
