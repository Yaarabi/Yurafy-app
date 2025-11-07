import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import WhatsAppConversation, { IWhatsAppMessage } from "@/models/whatsappMessage";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sendMessage";
import crypto from "crypto";
import Template, { ITemplate } from "@/models/templates";
import { encryptMessage } from "@/lib/whatsapp/messageEncryption";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";




// ------------------------
// Search template
// ------------------------
export async function getTemplate(ownerId: string, name: string) {
    const template = await Template.findOne({
        owner: ownerId,
        name,
    }).lean<ITemplate>();

    if (!template) return null;

    if (template.type === "TEXT") {
        return template.content || ""
    }

    // For media templates
    return `${template.link || ""}\n${template.caption || ""}`.trim()
}


// ------------------------
// Decrypt WhatsApp token or webhook secret
// ------------------------
export function decryptToken(encrypted: string) {
    if (!encrypted) throw new Error("Encrypted token is required");
    
    const [ivHex, encryptedText] = encrypted.split(":");
    if (!ivHex || !encryptedText) {
        throw new Error("Invalid encrypted token format");
    }
    
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
// GET: WhatsApp webhook verification (per-user token)
// ------------------------
export async function GET(req: NextRequest) {
    await connectDB();
    
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const phoneNumberId = url.searchParams.get("phone_number_id"); // Optional: helps identify account

    if (!mode || !token || !challenge) {
        return new NextResponse("Missing parameters", { status: 400 });
    }

    // Verify webhook using user's generated verify token
    if (mode === "subscribe") {
        try {
            let account = null;
            
            // If phone_number_id is provided, find specific account
            if (phoneNumberId) {
                account = await WhatsAppAccount.findOne({ 
                    waNumberId: phoneNumberId,
                    status: "connected"
                });
            } else {
                // Otherwise, check all accounts for matching verify token
                // This is less secure but Meta's webhook setup may not always include phone_number_id
                const accounts = await WhatsAppAccount.find({ status: "connected" });
                account = accounts.find(acc => acc.webhookVerifyToken === token);
            }
            
            // If user's generated token matches, return challenge
            if (account && account.webhookVerifyToken === token) {
                console.log(`[Webhook GET] Verified for account: ${account.owner}, phone: ${account.waNumber}`);
                return new NextResponse(challenge, {
                    status: 200,
                    headers: { "Content-Type": "text/plain" },
                });
            }
            
            console.warn(`[Webhook GET] Invalid verify token: ${token.substring(0, 10)}...`);
        } catch (err) {
            console.error("[Webhook GET] Verification error:", err);
        }
    }

    return new NextResponse("Forbidden", { status: 403 });
}



// ------------------------
// POST: WhatsApp webhook handler with signature verification and deduplication
// ------------------------
export async function POST(req: NextRequest) {
    await connectDB();

    try {
        // Get raw body for signature verification (must read as text first)
        const rawBody = await req.text();
        
        // Get signature header
        const signature = req.headers.get('X-Hub-Signature-256');
        
        // Parse body to get phone_number_id for account identification
        let bodyObj: any;
        try {
            bodyObj = JSON.parse(rawBody);
        } catch (err) {
            console.error("[Webhook POST] Invalid JSON body:", err);
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }
        
        const value = bodyObj.entry?.[0]?.changes?.[0]?.value;
        const phoneNumberId = value?.metadata?.phone_number_id;
        
        if (!phoneNumberId) {
            console.error("[Webhook POST] Missing phone_number_id in webhook payload");
            return NextResponse.json({ error: "Missing phone_number_id" }, { status: 400 });
        }
        
        // Find account by phone_number_id
        const account = await WhatsAppAccount.findOne({ 
            waNumberId: phoneNumberId,
            status: "connected",
            verified: true
        });
        
        if (!account) {
            console.warn(`[Webhook POST] Account not found for phone_number_id: ${phoneNumberId}`);
            return NextResponse.json({ ignored: true, reason: "Account not found" });
        }

        // Handle status updates (opt-in/opt-out)
        const statuses = value?.statuses;
        if (statuses && statuses.length > 0) {
            // Handle message status updates (sent, delivered, read, etc.)
            for (const status of statuses) {
                const recipientId = status.recipient_id;
                if (recipientId) {
                    // Update conversation's last read status if message was read
                    if (status.status === 'read') {
                        await WhatsAppConversation.findOneAndUpdate(
                            { owner: account.owner, "customer.phone": recipientId },
                            {
                                $set: {
                                    "metadata.lastReadStatus": "read",
                                    "metadata.lastReadAt": new Date(),
                                },
                            }
                        );
                    }
                }
            }
        }

        // Handle contacts (opt-in/opt-out events)
        const contacts = value?.contacts;
        if (contacts && contacts.length > 0) {
            for (const contact of contacts) {
                const phone = contact.wa_id;
                if (phone) {
                    // Normalize phone number for consistent database queries
                    const normalizedPhone = normalizePhoneNumber(phone);
                    
                    // Check if this is an opt-in or opt-out event
                    // WhatsApp sends profile information when user opts in
                    // We'll update the conversation's optInStatus based on whether we can get profile info
                    const profile = contact.profile;
                    if (profile) {
                        // User opted in - update conversation
                        await WhatsAppConversation.findOneAndUpdate(
                            { owner: account.owner, "customer.phone": normalizedPhone },
                            {
                                $set: {
                                    optInStatus: "opted_in",
                                    optInDate: new Date(),
                                    optOutDate: null,
                                    "customer.name": profile.name || undefined,
                                    "customer.phone": normalizedPhone,
                                },
                            },
                            { upsert: true }
                        );
                    }
                }
            }
        }

        // Handle messages
        const message = value?.messages?.[0];
        if (!message) {
            // No message to process, but status updates may have been handled above
            return NextResponse.json({ received: true });
        }
        
        // Verify webhook signature if secret is configured
        if (account.webhookSecretEncrypted) {
            if (!signature) {
                console.error(`[Webhook POST] Missing signature for account: ${account.owner}`);
                return NextResponse.json({ error: "Missing signature" }, { status: 403 });
            }
            
            try {
                // Decrypt per-user webhook secret
                const webhookSecret = decryptToken(account.webhookSecretEncrypted);
                
                // Calculate expected signature
                const expectedSignature = crypto
                    .createHmac('sha256', webhookSecret)
                    .update(rawBody)
                    .digest('hex');
                
                // Extract signature from header (format: sha256=...)
                const providedSignature = signature.replace('sha256=', '');
                
                // Use timing-safe comparison to prevent timing attacks
                if (expectedSignature.length !== providedSignature.length) {
                    console.error(`[Webhook POST] Invalid signature length for account: ${account.owner}`);
                    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
                }
                
                if (!crypto.timingSafeEqual(
                    Buffer.from(expectedSignature),
                    Buffer.from(providedSignature)
                )) {
                    console.error(`[Webhook POST] Invalid signature for account: ${account.owner}`);
                    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
                }
                
                console.log(`[Webhook POST] Signature verified for account: ${account.owner}`);
            } catch (err) {
                console.error(`[Webhook POST] Signature verification error for account: ${account.owner}:`, err);
                return NextResponse.json({ error: "Signature verification failed" }, { status: 403 });
            }
        } else {
            // Log warning if signature is not configured but header is present
            if (signature) {
                console.warn(`[Webhook POST] Signature header present but webhookSecretEncrypted not configured for account: ${account.owner}`);
            }
        }

        const from = message.from;
        const messageText = message.text?.body || "";
        const waMessageId = message.id;

        // Normalize phone number for consistent database queries
        // This ensures all messages from the same phone number go to the same conversation
        // regardless of opt-in/opt-out status
        const normalizedPhone = normalizePhoneNumber(from);

        // Check for opt-out keywords (STOP, UNSUBSCRIBE, etc.)
        const optOutKeywords = ['stop', 'unsubscribe', 'optout', 'opt-out', 'cancel'];
        const isOptOutMessage = optOutKeywords.some(keyword => 
            messageText.toLowerCase().trim().includes(keyword)
        );

        // Encrypt message text before saving
        const encryptedText = encryptMessage(messageText);
        
        // Prepare update data
        const updateData: any = {
            lastMessage: encryptedText, // Store encrypted
            lastTimestamp: Number(message.timestamp) * 1000, // Convert to milliseconds
            status: "open",
            "customer.phone": normalizedPhone, // Ensure phone is normalized
        };

        // If user sends opt-out message, update opt-out status
        if (isOptOutMessage) {
            updateData.optInStatus = "opted_out";
            updateData.optOutDate = new Date();
        }
        
        // Save conversation with message (encrypted)
        // Use normalized phone number to ensure all messages from the same number
        // (whether opted in or opted out) go to the same conversation
        const conv = await WhatsAppConversation.findOneAndUpdate(
            { owner: account.owner, "customer.phone": normalizedPhone },
            {
                $push: {
                    messages: {
                        waMessageId: waMessageId,
                        from: normalizedPhone,
                        text: encryptedText, // Store encrypted
                        direction: "incoming",
                        timestamp: Number(message.timestamp) * 1000, // Convert to milliseconds
                    },
                },
                $set: updateData,
                $inc: { unreadCount: 1 },
            },
            { upsert: true, new: true }
        );

        // -------------------------------
        // Optional: delete old messages, keep only latest 12
        // -------------------------------
        if (conv && conv.messages.length > 12) {
            conv.messages = conv.messages
                .sort((a: IWhatsAppMessage, b: IWhatsAppMessage) => b.timestamp - a.timestamp) // newest first
                .slice(0, 12) // keep only 12 newest
                .sort((a: IWhatsAppMessage, b: IWhatsAppMessage) => a.timestamp - b.timestamp); // restore chronological order
            await conv.save();
        }

        // 🔄 Trigger automation (no session window restrictions)
        await fetch(`${process.env.NEXTAUTH_URL}/api/whatsapp/automation`, {    
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accountId: account._id,
                from,
                messageText,
            }),
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Webhook error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}




