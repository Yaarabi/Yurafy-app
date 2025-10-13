
import axios from "axios";
import WhatsAppMessage from "@/models/whatsappMessage";
import { connectDB } from "@/lib/db/mongoDB";

export async function sendWhatsAppMessage(account: any, to: string, text: string, token: string) {
    await connectDB();

    await axios.post(
        `https://graph.facebook.com/v17.0/${account.waBusinessId}/messages`,
        {
        messaging_product: "whatsapp",
        to,
        type:      "text",
        text: { body: text },
        },
        {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        }
    );

    await WhatsAppMessage.create({
        owner: account.owner,
        from: account.waNumber,
        to,
        type: "text",
        text,
        timestamp: Date.now(),
        direction: "outgoing",
    });
}

