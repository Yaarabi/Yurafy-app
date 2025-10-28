import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import { decryptToken, getTemplate } from "../webhook/route";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sendMessage";
import { generateCustomerAIResponse } from "@/lib/agent/agent";

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

        const account = await WhatsAppAccount.findById(accountId);
        if (!account)
            return NextResponse.json({ error: "Account not found" }, { status: 404 });

        const decryptedToken = decryptToken(account.waTokenEncrypted);

        // 🧩 1️⃣ AI Agent (Customer)
        if (account.settings.aiAgent) {
            console.log("AI active")
            try {
                const customerReply = await generateCustomerAIResponse(
                    account.owner,
                    from,
                    messageText
                );

                if (customerReply) {
                    await sendWhatsAppMessage(account, from, customerReply, decryptedToken, { isAIResponse: true });
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
            const templateContent = await getTemplate(account.owner, rule.template);
            if (templateContent) {
                await sendWhatsAppMessage(account, from, templateContent, decryptedToken);
                return NextResponse.json({ type: "adDetection", success: true });
            }
            }
        }
        }

        // 🧩 3️⃣ AutoReply (optional) 
        if (account.settings.autoReply && account.preferredTemplates?.greeting) {
            console.log("Auto repla active")
            const greetingTemplate = await getTemplate(
                account.owner,
                account.preferredTemplates.greeting
            );
            if (greetingTemplate) {
                await sendWhatsAppMessage(account, from, greetingTemplate, decryptedToken);
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
