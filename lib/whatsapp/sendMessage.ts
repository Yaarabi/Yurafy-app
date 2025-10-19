import axios from "axios";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation from "@/models/whatsappMessage";

/**
 * Send a WhatsApp message using WhatsApp Cloud API
 * @param account WhatsApp account object from DB
 * @param to Recipient phone number in international format
 * @param text Message body
 * @param token Decrypted access token
 * @param options Additional options like isAIResponse
 */
export async function sendWhatsAppMessage(
    account: any,
    to: string,
    text: string | any,
    token: string,
    options: { isAIResponse?: boolean } = {}
    ) {
    await connectDB();

    try {

        const messageText = typeof text === "string" ? text : JSON.stringify(text);
        // Send message via WhatsApp Cloud API
        await axios.post(
        `https://graph.facebook.com/v17.0/${account.waNumberId}/messages`,
        {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: messageText },
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
        }
        );

        // Prepare message object for conversation
        const newMessage = {
        from: account.waNumber,
        to,
        type: "text",
        text: messageText,
        direction: "outgoing",
        status: "sent",
        timestamp: Date.now(),
        isAIResponse: options.isAIResponse || false,
        };

        // Add message to conversation or create new conversation if not exists
        await WhatsAppConversation.findOneAndUpdate(
        { owner: account.owner, "customer.phone": to },
        {
            $setOnInsert: {
            owner: account.owner,
            customer: { phone: to },
            status: "open",
            aiEnabled: account.settings.aiAgent || false,
            },
            $push: { messages: newMessage },
            $set: { lastMessage: text, lastTimestamp: newMessage.timestamp },
        },
        { upsert: true, new: true }
        );
    } catch (err) {
        console.error("Failed to send WhatsApp message:", err);
        throw err;
    }
}
