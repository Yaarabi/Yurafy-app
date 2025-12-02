import axios from "axios";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation from "@/models/whatsappMessage";
import { normalizePhoneNumber } from "./phoneNormalize";
import { encryptMessage } from "./messageEncryption";

/**
 * Send a WhatsApp message using WhatsApp Cloud API
 * 
 * Note: 24-hour session window checks have been removed.
 * Messages can be sent at any time regardless of session window.
 * 
 * @param account WhatsApp account object from DB
 * @param to Recipient phone number in international format (will be normalized)
 * @param text Message body
 * @param token Decrypted access token
 * @param options Additional options like isAIResponse and buttons
 */
export async function sendWhatsAppMessage(
    account: any,
    to: string,
    text: string | any,
    token: string,
    options: { 
        isAIResponse?: boolean;
        buttons?: Array<{
            type: "QUICK_REPLY" | "URL" | "PHONE";
            text: string;
            payload?: string;
            url?: string;
            phoneNumber?: string;
        }>;
    } = {}
) {
    await connectDB();

    try {
        // Validate token exists and is not empty
        if (!token || !token.trim()) {
            throw new Error("WhatsApp API token is missing or empty");
        }

        // Normalize phone number for consistent database queries
        const normalizedPhone = normalizePhoneNumber(to);
        
        // Convert text to string format
        const messageText = typeof text === "string" ? text : JSON.stringify(text);
        
        // Build message payload based on whether buttons are provided
        let messagePayload: any;
        
        if (options.buttons && options.buttons.length > 0) {
            // Interactive message with buttons (max 3 reply buttons)
            // Note: WhatsApp API only supports QUICK_REPLY buttons in interactive messages
            // URL and PHONE buttons are only supported in template messages
            const replyButtons = options.buttons
                .filter(btn => btn.type === "QUICK_REPLY")
                .slice(0, 3) // WhatsApp API allows max 3 reply buttons
                .map((btn, index) => ({
                    type: "reply",
                    reply: {
                        id: btn.payload || `button_${index}`,
                        title: btn.text.substring(0, 20), // Max 20 characters for button title
                    },
                }));

            if (replyButtons.length > 0) {
                messagePayload = {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: normalizedPhone,
                    type: "interactive",
                    interactive: {
                        type: "button",
                        body: {
                            text: messageText,
                        },
                        action: {
                            buttons: replyButtons,
                        },
                    },
                };
            } else {
                // No QUICK_REPLY buttons, send as plain text with button info in footer
                const buttonText = options.buttons
                    .map(btn => {
                        if (btn.type === "URL") return `🔗 ${btn.text}: ${btn.url}`;
                        if (btn.type === "PHONE") return `📞 ${btn.text}: ${btn.phoneNumber}`;
                        return btn.text;
                    })
                    .join('\n');
                
                messagePayload = {
                    messaging_product: "whatsapp",
                    to: normalizedPhone,
                    type: "text",
                    text: { body: `${messageText}\n\n${buttonText}` },
                };
            }
        } else {
            // Simple text message
            messagePayload = {
                messaging_product: "whatsapp",
                to: normalizedPhone,
                type: "text",
                text: { body: messageText },
            };
        }

        // Send message via WhatsApp Cloud API
        try {
            const response = await axios.post(
                `https://graph.facebook.com/v17.0/${account.waNumberId}/messages`,
                messagePayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (apiError: any) {
            // Handle 401 Unauthorized errors specifically
            if (apiError.response?.status === 401) {
                const errorMessage = apiError.response?.data?.error?.message || "Unauthorized";
                const errorCode = apiError.response?.data?.error?.code || "unknown";
                const errorType = apiError.response?.data?.error?.type || "unknown";
                
                console.error(`[sendWhatsAppMessage] WhatsApp API 401 Unauthorized error:`, {
                    accountId: account._id,
                    owner: account.owner,
                    phoneNumberId: account.waNumberId,
                    to: normalizedPhone,
                    errorCode,
                    errorType,
                    errorMessage,
                    tokenLength: token.length,
                    tokenPrefix: token.substring(0, 10) + "...",
                });
                
                throw new Error(
                    `WhatsApp API authentication failed (401): ${errorMessage}. ` +
                    `The access token may be invalid, expired, or revoked. ` +
                    `Please reconnect your WhatsApp account. Error code: ${errorCode}`
                );
            }
            
            // Re-throw other errors as-is
            throw apiError;
        }

        // Encrypt message text before saving
        const encryptedText = encryptMessage(messageText);
        
        // Prepare message object for conversation (with encrypted text)
        const newMessage = {
            from: account.waNumber,
            to: normalizedPhone,
            type: "text",
            text: encryptedText, // Store encrypted
            direction: "outgoing",
            status: "sent",
            timestamp: Date.now(),
            isAIResponse: options.isAIResponse || false,
        };

        // Add message to conversation or create new conversation if not exists
        await WhatsAppConversation.findOneAndUpdate(
            { owner: account.owner, "customer.phone": normalizedPhone },
            {
                $setOnInsert: {
                    owner: account.owner,
                    customer: { phone: normalizedPhone },
                    status: "open",
                    aiEnabled: account.settings?.aiAgent || false,
                },
                $push: { messages: newMessage },
                $set: { lastMessage: encryptedText, lastTimestamp: newMessage.timestamp }, // Store encrypted
            },
            { upsert: true, new: true }
        );
    } catch (err: any) {
        // Log detailed error information
        const errorDetails = {
            accountId: account?._id,
            owner: account?.owner,
            phoneNumberId: account?.waNumberId,
            to,
            errorMessage: err.message,
            errorCode: err.response?.status,
            errorData: err.response?.data,
        };
        
        console.error(`[sendWhatsAppMessage] Failed to send message:`, errorDetails);
        throw err;
    }
}
