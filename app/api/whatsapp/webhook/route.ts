import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import WhatsAppConversation from "@/models/whatsappMessage";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sendMessage";
import crypto from "crypto";
// import { generateAIResponse } from "@/lib/whatsapp/aiAgent"; // optional AI handler

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
    console.log("✅ Incoming WhatsApp message webhook");

    try {
        const body = await req.json();
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages;

        if (!messages) return NextResponse.json({ received: true });

        const phoneNumberId = value.metadata.phone_number_id;
        const account = await WhatsAppAccount.findOne({ waNumberId: phoneNumberId });

        if (!account) {
            console.warn("⚠️ WhatsApp account not found for phone number:", phoneNumberId);
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        // 🔒 Check if account is connected and verified
        if (account.status !== "connected" || !account.verified) {
            console.warn(`⚠️ Account ${account.waNumber} is not connected or verified`);
            return NextResponse.json({ ignored: true });
        }

        const decryptedToken = decryptToken(account.waTokenEncrypted);

        for (const msg of messages) {
            const from = msg.from;
            const messageText = msg.text?.body || "";

            // 🗃️ Add or update conversation
            const newMessage = {
                waMessageId: msg.id,
                from,
                to: value.metadata.display_phone_number,
                type: msg.type,
                text: messageText,
                mediaUrl: msg.image?.id || msg.document?.id || null,
                direction: "incoming",
                status: "sent",
                timestamp: Number(msg.timestamp),
                isAIResponse: false,
            };

            const conversation = await WhatsAppConversation.findOneAndUpdate(
                { owner: account.owner, "customer.phone": from },
                {
                    $push: { messages: newMessage },
                    $set: {
                        lastMessage: messageText,
                        lastTimestamp: Number(msg.timestamp),
                        status: "open",
                    },
                    $inc: { unreadCount: 1 },
                },
                { upsert: true, new: true }
            );

            // ------------------------
            // 🧠 Handle Automation Logic
            // ------------------------

            // 1️⃣ Auto Reply
            if (account.settings.autoReply) {
                console.log("🤖 Auto reply active");
                await sendWhatsAppMessage(account, from, account.templates.greeting, decryptedToken);
            }
            // 2️⃣ Order Confirmation
            else if (
                account.settings.orderConfirmation &&
                /order|commande|pedido/i.test(messageText)
            ) {
                console.log("📦 Order confirmation triggered");
                await sendWhatsAppMessage(account, from, account.templates.orderConfirmation, decryptedToken);
            }
            // 3️⃣ AI Agent
            else if (account.settings.aiAgent) {
                console.log("🧠 AI agent active");
                try {
                    // const aiReply = await generateAIResponse(account.aiConfig, messageText);
                    const aiReply = `AI (${account.aiConfig.personality}): ${messageText}`;
                    await sendWhatsAppMessage(account, from, aiReply, decryptedToken);
                } catch (err) {
                    console.error("AI reply failed:", err);
                    await sendWhatsAppMessage(account, from, account.templates.fallback, decryptedToken);
                }
            }
            // 4️⃣ Fallback
            else {
                console.log("💤 No automation active");
                await sendWhatsAppMessage(account, from, account.templates.fallback, decryptedToken);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Webhook error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
