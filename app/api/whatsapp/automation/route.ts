
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import { decryptToken, getTemplate } from "../webhook/route"; 
import { sendWhatsAppMessage } from "@/lib/whatsapp/sendMessage";

export async function POST(req: NextRequest) {
    await connectDB();

    try {
        const { accountId, from, messageText } = await req.json();
        const account = await WhatsAppAccount.findById(accountId);
        if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

        const decryptedToken = decryptToken(account.waTokenEncrypted);

        // 🧩 1️⃣ AutoReply
        if (account.settings.autoReply && account.preferredTemplates?.greeting) {
        const greetingTemplate = await getTemplate(account.owner, account.preferredTemplates.greeting);
        if (greetingTemplate) {
            await sendWhatsAppMessage(account, from, greetingTemplate, decryptedToken);
            return NextResponse.json({ type: "autoReply", success: true });
        }
        }

        // 🧩 2️⃣ Detection Rules (Ad automation)
        if (account.settings.ad && Array.isArray(account.detectionRules)) {
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

        // 🧩 3️⃣ AI Agent placeholder
        // if (account.settings.aiAgent) {
        //   const aiReply = await generateAIResponse(messageText, account.aiConfig);
        //   await sendWhatsAppMessage(account, from, aiReply, decryptedToken);
        //   return NextResponse.json({ type: "aiResponse", success: true });
        // }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Automation error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
