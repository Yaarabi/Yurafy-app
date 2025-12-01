import axios from "axios";
import { IWhatsAppAccount } from "@/models/whatsappAccount";
import Template, { ITemplate } from "@/models/templates";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation from "@/models/whatsappMessage";
import { normalizePhoneNumber } from "./phoneNormalize";

export async function sendTemplateMessage(
    account: IWhatsAppAccount,
    customerPhone: string,
    template: ITemplate,
    variableValues: string[] = [],
    token: string
    ) {
    await connectDB();

    const phone = normalizePhoneNumber(customerPhone);
    const templateName = template.metaName;

    const components: any[] = [];
    if (template.variables && template.variables.length > 0 && variableValues.length > 0) {
        const bodyParameters = variableValues
        .slice(0, template.variables.length)
        .map(v => ({
            type: "text",
            text: String(v || "")
        }));

        if (bodyParameters.length > 0) {
        components.push({
            type: "body",
            parameters: bodyParameters
        });
        }
    }

    try {
        // Call WhatsApp Cloud API
        const response = await axios.post(
        `https://graph.facebook.com/v17.0/${account.waNumberId}/messages`,
        {
            messaging_product: "whatsapp",
            to: phone,
            type: "template",
            template: {
            name: templateName,
            language: { code: template.languageCode || "en_US" },
            components: components.length > 0 ? components : undefined
            }
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
            }
        }
        );

        // WhatsApp API returns an "error" field if sending failed
        if (response.data.error) {
        return {
            success: false,
            error: response.data.error.message || "Unknown error sending template"
        };
        }

        // Save message only if successful
        const newMessage = {
        from: account.waNumber,
        to: phone,
        type: "text",
        text: template.type === "TEXT" ? (template.content || "") : (template.caption || ""),
        direction: "outgoing",
        status: "sent",
        timestamp: Date.now(),
        isAIResponse: false
        };

        await WhatsAppConversation.findOneAndUpdate(
        { owner: account.owner, "customer.phone": phone },
        {
            $setOnInsert: {
            owner: account.owner,
            customer: { phone },
            status: "open",
            aiEnabled: account.settings?.aiAgent || false
            },
            $push: { messages: newMessage },
            $set: {
            lastMessage: newMessage.text,
            lastTimestamp: newMessage.timestamp
            }
        },
        { upsert: true, new: true }
        );

        return { success: true, data: response.data };

    } catch (err: any) {
        // Axios error handling
        return {
        success: false,
        error: err.response?.data?.error?.message || err.message || "Failed to send template"
        };
    }
}
