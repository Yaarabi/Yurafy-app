// lib/whatsappSend.ts
import axios from "axios";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation from "@/models/whatsappMessage"
import { IWhatsAppMessage } from "@/models/whatsappMessage";
import { IWhatsAppAccount } from "@/models/whatsappAccount";
import { isWithin24HourWindow } from "./sessionWindow";

/**
 * Send a WhatsApp text message to a customer (for send-confirmations route)    
 * @param account WhatsApp account from DB
 * @param to Customer phone number
 * @param text Message content
 * @param token Decrypted WhatsApp API token
 * @param options Optional flags like isAIResponse
 */
export async function sendWhatsAppMessageRoute(
    account: IWhatsAppAccount,
    to: string,
    text: string,
    token: string,
    options: { isAIResponse?: boolean } = {}
) {
    await connectDB();

    try {
        if (!to || !text) throw new Error("Phone or text is missing");

        // Check if within 24-hour window before sending text message
        const withinWindow = await isWithin24HourWindow(account, to);
        
        if (!withinWindow) {
            const errorMsg = "24-hour session window expired. Cannot send text message. Use approved template message instead.";
            console.error(`[sendWhatsAppMessageRoute] ${errorMsg} Account: ${account.owner}, Phone: ${to}`);
            throw new Error(errorMsg);
        }

        // Normalize phone number
        let customerPhone = to.replace(/\D/g, "");
        if (!customerPhone.startsWith("+")) customerPhone = "+" + customerPhone;                                                                                
        // Send message via WhatsApp Cloud API
        const response = await axios.post(
        `https://graph.facebook.com/v17.0/${account.waNumberId}/messages`,      
        {
            messaging_product: "whatsapp",
            to: customerPhone,
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

        // Create new message object
        const newMessage: IWhatsAppMessage = {
        from: account.waNumber,
        to: customerPhone,
        type: "text",
        text,
        direction: "outgoing",
        status: "sent",
        timestamp: Date.now(),
        isAIResponse: options.isAIResponse || false,
        };

        // Add to conversation or create if not exists
        await WhatsAppConversation.findOneAndUpdate(
        { owner: account.owner, "customer.phone": customerPhone },
        {
            $setOnInsert: {
            owner: account.owner,
            customer: { phone: customerPhone },
            status: "open",
            aiEnabled: account.settings?.aiAgent || false,
            },
            $push: { messages: newMessage },
            $set: { lastMessage: text, lastTimestamp: newMessage.timestamp },   
        },
        { upsert: true, new: true }
        );

        return response.data;
    } catch (err: any) {
        if (err.response?.data) console.error("WhatsApp API error:", err.response.data);                                                                        
        else console.error("Failed to send WhatsApp message:", err.message || err);                                                                             
        throw err;
    }
}
