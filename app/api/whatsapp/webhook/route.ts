import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import WhatsAppConversation from "@/models/whatsappMessage";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sendMessage";
import crypto from "crypto";
import Template from "@/models/templates";




// ------------------------
// Search template
// ------------------------
async function getTemplate(ownerId: string, name: string) {
    const template = await Template.findOne({
        owner: ownerId,
        name,
    });

    return template?.content || null;
}


// ------------------------
// Decrypt WhatsApp token
// ------------------------
export function decryptToken(encrypted: string) {
    const [ivHex, encryptedText] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(
        "aes-256-ctr",
        Buffer.from(process.env.ENCRYPTION_KEY!, "hex"),
        iv
    );

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedText, "hex")),
        decipher.final(),
    ]).toString();

    return decrypted;
}

// ------------------------
// GET: WhatsApp webhook verification
// ------------------------
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (!mode || !token || !challenge) {
        return new NextResponse("Missing parameters", { status: 400 });
    }

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new NextResponse(challenge, {
            status: 200,
            headers: { "Content-Type": "text/plain" },
        });
    }

    return new NextResponse("Forbidden", { status: 403 });
}


// ------------------------
// POST: Incoming WhatsApp messages
// ------------------------
export async function POST(req: NextRequest) {
    await connectDB();

    try {
        const body = await req.json();
        const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        if (!message) return NextResponse.json({ received: true });

        const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
        const account = await WhatsAppAccount.findOne({ waNumberId: phoneNumberId });

        if (!account || account.status !== "connected" || !account.verified)
        return NextResponse.json({ ignored: true });

        const decryptedToken = decryptToken(account.waTokenEncrypted);
        const from = message.from;
        const messageText = message.text?.body || "";

        // 1️⃣ Save message
        await WhatsAppConversation.findOneAndUpdate(
        { owner: account.owner, "customer.phone": from },
        {
            $push: {
            messages: {
                waMessageId: message.id,
                from,
                to: body.entry[0].changes[0].value.metadata.display_phone_number,
                type: message.type,
                text: messageText,
                direction: "incoming",
                status: "sent",
                timestamp: Number(message.timestamp),
                isAIResponse: false,
            },
            },
            $set: {
            lastMessage: messageText,
            lastTimestamp: Number(message.timestamp),
            status: "open",
            },
            $inc: { unreadCount: 1 },
        },
        { upsert: true, new: true }
        );



        let reply: string | null = null;

        if (account.settings.autoReply) {
        reply = await getTemplate( account.owner, account.preferredTemplates?.greeting || "greeting");
        } else if (account.settings.aiAgent) {
        reply = `AI (${account.aiConfig.personality}): ${messageText}`;
        } else {
        reply = await getTemplate( account.owner,account.preferredTemplates?.fallback || "fallback");
        }

        if (reply) await sendWhatsAppMessage(account, from, reply, decryptedToken);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Webhook error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    }

