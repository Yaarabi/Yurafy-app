import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import WhatsAppMessage from "@/models/whatsappMessage";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sendMessage";
import crypto from "crypto";

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

        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages;

        if (!messages) return NextResponse.json({ received: true });

        // Correct: find account by Phone Number ID
        const phoneNumberId = value.metadata.phone_number_id;
        const account = await WhatsAppAccount.findOne({ waNumberId: phoneNumberId });
        if (!account)
        return NextResponse.json({ error: "Account not found" }, { status: 404 });

        const decryptedToken = decryptToken(account.waTokenEncrypted);

        for (const msg of messages) {
        // Store incoming message
        await WhatsAppMessage.create({
            owner: account.owner,
            from: msg.from,
            to: value.metadata.display_phone_number,
            type: msg.type,
            text: msg.text?.body,
            mediaUrl: msg.image?.id || msg.document?.id || null,
            timestamp: Number(msg.timestamp),
            direction: "incoming",
        });

        // Auto-reply if bot is enabled and message is text
        if (account.botEnabled && msg.type === "text") {
            try {
            await sendWhatsAppMessage(account, msg.from, account.botTemplate, decryptedToken);
            } catch (err) {
            console.error("Failed to send auto-reply:", err);
            }
        }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Webhook error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
