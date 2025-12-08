

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/automation/whatsappAccount";
import Template from "@/models/automation/templates";
import { decryptToken } from "../webhook/route";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sendMessage";
import { sendTemplateMessage } from "@/lib/whatsapp/sendTemplate";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { message, templateId, contactPhone, variableValues } = body;
    
    const account = await WhatsAppAccount.findOne({ owner: session.user.id });  
    if (!account || !account.verified) {
        return NextResponse.json({ error: "Account not connected" }, { status: 404 });                                                                          
    }

    const decryptedToken = decryptToken(account.waTokenEncrypted);

    // If template and contact are provided, send template message
    if (templateId && contactPhone) {
        try {
            // Fetch template
            const template = await Template.findOne({ 
                _id: templateId,
                owner: session.user.id
            });

            if (!template) {
                return NextResponse.json({ error: "Template not found" }, { status: 404 });                                                                     
            }

            // Check if template is approved
            if (template.status !== "APPROVED") {
                return NextResponse.json({ 
                    error: `Template is not approved. Status: ${template.status}` 
                }, { status: 400 });
            }

            // Normalize phone number to E.164 format
            const recipientPhone = normalizePhoneNumber(contactPhone);

            // Ensure variableValues is an array
            const vars = Array.isArray(variableValues) ? variableValues : [];

            // Send as template message (works outside 24h window)
            await sendTemplateMessage(
                account,
                recipientPhone,
                template,
                vars,
                decryptedToken
            );

            return NextResponse.json({
                success: true,
                message: "Template message sent successfully",
                type: "template"
            });
        } catch (err: any) {
            console.error("Error sending template message:", err);
            return NextResponse.json({
                error: err.message || "Failed to send template message"
            }, { status: 500 });
        }
    }

    // Legacy support: plain text message (only within 24h window)
    if (message && contactPhone) {
        try {
            // Normalize phone number to E.164 format
            const recipientPhone = normalizePhoneNumber(contactPhone);

            // This will check 24h window internally and throw if expired
            await sendWhatsAppMessage(account, recipientPhone, message, decryptedToken);
            
            return NextResponse.json({ 
                success: true, 
                message: "Text message sent successfully",
                type: "text"
            });
        } catch (err: any) {
            console.error("Error sending text message:", err);
            return NextResponse.json({
                error: err.message || "Failed to send text message"
            }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Message or template required" }, { status: 400 });                                                                       
}
