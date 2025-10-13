import axios from "axios";
import WhatsAppMessage from "@/models/whatsappMessage";
import { connectDB } from "@/lib/db/mongoDB";

/**
 * Send a WhatsApp message using WhatsApp Cloud API
 * @param account WhatsApp account object from DB
 * @param to Recipient phone number in international format
 * @param text Message body
 * @param token Decrypted access token
 */
export async function sendWhatsAppMessage(
    account: any,
    to: string,
    text: string,
    token: string
    ) {
    await connectDB();

    try {
        await axios.post(
        `https://graph.facebook.com/v17.0/${account.waNumberId}/messages`,
        {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: text },
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
        }
        );

        // Store outgoing message
        await WhatsAppMessage.create({
        owner: account.owner,
        from: account.waNumber,
        to,
        type: "text",
        text,
        timestamp: Date.now(),
        direction: "outgoing",
        });
    } catch (err) {
        console.error("Failed to send WhatsApp message:", err);
        throw err;
    }
}
