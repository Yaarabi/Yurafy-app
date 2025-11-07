import axios from "axios";
import { IWhatsAppAccount } from "@/models/whatsappAccount";
import Template, { ITemplate } from "@/models/templates";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation from "@/models/whatsappMessage";
import { normalizePhoneNumber } from "./phoneNormalize";

/**
 * Send a WhatsApp template message via the official API
 * Template messages can be sent outside the 24-hour window
 * 
 * @param account WhatsApp account object
 * @param customerPhone Customer phone number in international format
 * @param template Template object from database
 * @param variableValues Array of variable values to replace {{1}}, {{2}}, etc.
 * @param token Decrypted WhatsApp access token
 * @returns API response data
 */
export async function sendTemplateMessage(
    account: IWhatsAppAccount,
    customerPhone: string,
    template: ITemplate,
    variableValues: string[] = [],
    token: string
) {
    await connectDB();
    
    // Normalize phone number to E.164 format
    const phone = normalizePhoneNumber(customerPhone);
    
    // Build template name (must be lowercase with underscores)
    const templateName = template.name.toLowerCase().replace(/\s+/g, "_");
    
    // Build components array for variable substitution
    const components: any[] = [];
    
    // Only add body parameters if template has variables and values are provided
    if (template.variables && template.variables.length > 0 && variableValues.length > 0) {
        const bodyParameters = variableValues
            .slice(0, template.variables.length) // Only use as many as template has
            .map(v => ({
                type: "text",
                text: String(v || "") // Ensure string, handle undefined
            }));
        
        if (bodyParameters.length > 0) {
            components.push({
                type: "body",
                parameters: bodyParameters
            });
        }
    }
    
    // Send as template message via WhatsApp Cloud API
    const response = await axios.post(
        `https://graph.facebook.com/v17.0/${account.waNumberId}/messages`,
        {
            messaging_product: "whatsapp",
            to: phone,
            type: "template",
            template: {
                name: templateName,
                language: { code: "en_US" },
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
    
    // Save message to conversation
    const newMessage = {
        from: account.waNumber,
        to: phone,
        type: "text", // Template messages are stored as text
        text: template.type === "TEXT" ? (template.content || "") : (template.caption || ""),
        direction: "outgoing",
        status: "sent",
        timestamp: Date.now(),
        isAIResponse: false,
    };
    
    await WhatsAppConversation.findOneAndUpdate(
        { owner: account.owner, "customer.phone": phone },
        {
            $setOnInsert: {
                owner: account.owner,
                customer: { phone: phone },
                status: "open",
                aiEnabled: account.settings?.aiAgent || false,
            },
            $push: { messages: newMessage },
            $set: { 
                lastMessage: newMessage.text, 
                lastTimestamp: newMessage.timestamp 
            },
        },
        { upsert: true, new: true }
    );
    
    return response.data;
}
