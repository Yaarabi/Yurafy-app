
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/automation/whatsappAccount";
import WhatsAppConversation from "@/models/automation/whatsappMessage";
import Template from "@/models/automation/templates";
import { decryptToken, getTemplate } from "../webhook/route";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sendMessage";
import { generateCustomerAIResponse } from "@/lib/agent/agent";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";

/**
 * Handles incoming WhatsApp messages from customers
 * - AutoReply / Detection Rules can still be applied
 * - AI Agent replies to customer messages
 */
export async function POST(req: NextRequest) {
    await connectDB();

    try {
        const { accountId, from, messageText } = await req.json();
        if (!accountId || !from || !messageText)
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

        // Normalize phone number to E.164 format for consistent database queries
        const normalizedFrom = normalizePhoneNumber(from);

        const account = await WhatsAppAccount.findById(accountId);
        if (!account)
            return NextResponse.json({ error: "Account not found" }, { status: 404 });

        // Ensure owner has WhatsApp feature
        const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
        const check = await ensureFeatureEnabled(String(account.owner), 'whatsapp');
        if (check) return check;

        const decryptedToken = decryptToken(account.waTokenEncrypted);

        // 🧩 1️⃣ AI Agent (Customer)
        if (account.settings.aiAgent) {
            try {
                // Ensure owner has AI agent feature
                const aiCheck = await ensureFeatureEnabled(String(account.owner), 'ai.agent');
                if (aiCheck) return aiCheck;
                const customerReply = await generateCustomerAIResponse(
                    account.owner,
                    normalizedFrom,
                    messageText
                );

                if (customerReply) {
                    await sendWhatsAppMessage(account, normalizedFrom, customerReply, decryptedToken, { isAIResponse: true });
                    return NextResponse.json({ type: "aiResponse", success: true });
                }
            } catch (err) {
                console.error("Customer AI agent error:", err);
                return NextResponse.json({ error: "Failed to response" }, { status: 404 });
            }
        }



        // 🧩 2️⃣ Detection Rules (optional)
        if (account.detectionRules?.length) {
        for (const rule of account.detectionRules) {
            if (!rule.active || !rule.keywords?.length || !rule.template) continue;

            const matched = rule.keywords.some((k: string) =>
            messageText.toLowerCase().includes(k.toLowerCase())
            );

            if (matched) {
                // Fetch full template with buttons
                const template = await Template.findOne({
                    owner: account.owner,
                    name: rule.template,
                    // status: "APPROVED"
                });
                
                if (template) {
                    // Handle both TEXT and media templates
                    if (template.type === "TEXT") {
                        const templateContent = template.content || "";
                        await sendWhatsAppMessage(
                            account, 
                            normalizedFrom, 
                            templateContent, 
                            decryptedToken,
                            { buttons: template.buttons }
                        );
                    } else {
                        // Media template (IMAGE, VIDEO, AUDIO, DOCUMENT)
                        await sendWhatsAppMessage(
                            account,
                            normalizedFrom,
                            template.caption || "",
                            decryptedToken,
                            { 
                                buttons: template.buttons,
                                mediaType: template.type,
                                mediaUrl: template.link
                            }
                        );
                    }
                    return NextResponse.json({ type: "detectionRule", success: true });
                }
            }
        }
        }

        // 🧩 3️⃣ AutoReply (optional) 
        if (account.settings.autoReply && account.preferredTemplates?.greeting) {

            
            // Fetch full template with buttons
            const template: any = await Template.findOne({
                owner: account.owner,
                name: account.preferredTemplates.greeting,
            }).lean();
            

            if (template) {
                // Handle both TEXT and media templates
                if (template.type === "TEXT") {
                    const templateContent = template.content || "";
                    await sendWhatsAppMessage(
                        account, 
                        normalizedFrom, 
                        templateContent, 
                        decryptedToken,
                        { buttons: template.buttons }
                    );
                } else {
                    // Media template (IMAGE, VIDEO, AUDIO, DOCUMENT)
                    await sendWhatsAppMessage(
                        account,
                        normalizedFrom,
                        template.caption || "",
                        decryptedToken,
                        { 
                            buttons: template.buttons,
                            mediaType: template.type,
                            mediaUrl: template.link
                        }
                    );
                }
                
                // Track auto reply sent
                await WhatsAppConversation.findOneAndUpdate(
                    { owner: account.owner, "customer.phone": normalizedFrom },
                    {
                        $set: {
                            "metadata.autoReplySent": true,
                            "metadata.autoReplySentAt": new Date(),
                        },
                    },
                    { upsert: true }
                );
                
                return NextResponse.json({ type: "autoReply", success: true });
            }
        }

        // Default: nothing triggered
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Customer automation route error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}