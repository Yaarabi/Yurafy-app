
// File: templateGuideTool.ts

import mongoose from "mongoose";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { connectDB } from "@/lib/db/mongoDB";
import AIAgent, { IAIAgent } from "@/models/ai-agent";
import Template, { ITemplate } from "@/models/templates";
import WhatsAppAccount from "@/models/whatsappAccount";
import Notification from "@/models/notification";
import { sendTemplateMessage } from "@/lib/whatsapp/sendTemplate";
import { decryptToken } from "@/app/api/whatsapp/webhook/route";

/**
 * Helper function to get templates for an AI agent.
 * Returns array of objects containing only name, content, link, caption.
 */
export async function getAgentTemplates(agentOwnerId: string) {
    await connectDB();

    // 1️⃣ Get the AI agent for this owner
    const agent = await AIAgent.findOne({ owner: agentOwnerId }).lean<IAIAgent>();
    if (!agent) return [];

    let templateNames = agent.templates || [];

    // Flatten in case it's nested
    templateNames = templateNames.flat();

    if (!templateNames.length) return [];

    // 2️⃣ Fetch approved templates that match the agent's template names
    const templates = await Template.find({
        owner: new mongoose.Types.ObjectId(agentOwnerId),
        // status: "APPROVED",
        name: { $in: templateNames },
        caption: { $ne: "" }, // Only templates with non-empty caption
    }).lean();

    // 3️⃣ Map to clean objects
    return templates.map((tpl) => ({
        name: tpl.name,
        content: tpl.content || "",
        link: tpl.link || "",
        caption: tpl.caption || "",
    }));
}

/**
 * LangChain Tool: Template Guide
 * Suggests templates to the AI agent based on customer query matching template captions.
 */
export const templateGuideTool = tool(
    async ({ agentOwnerId, query }) => {

        console.log("Hayi 4i")
        const templates = await getAgentTemplates(agentOwnerId);

        if (!templates.length) return "No templates found for this agent.";

        // Filter templates where caption matches the query
        const relevant = templates.filter((tpl) =>
        tpl.caption.toLowerCase().includes(query.toLowerCase())
        );

        if (!relevant.length) return `No relevant templates found for: "${query}"`;

        console.log(relevant)
        // Format results for agent usage
        return relevant
        .map(
            (tpl) =>
            `Template: ${tpl.name}\nCaption: ${tpl.caption}\nContent: ${tpl.content}\nLink: ${tpl.link}`
        )
        .join("\n\n");
    },
    {
        name: "template_guide",
        description:
        "Suggests relevant templates to use when responding to customers, based on the template captions.",
        schema: z.object({
        agentOwnerId: z.string().describe("your owner ID"),
        query: z.string().describe("Customer question or topic to find relevant templates"),
        }),
    }
);

/**
 * LangChain Tool: Send Template Message
 * Allows AI agent to send approved WhatsApp templates to customers
 */
export const sendTemplateTool = tool(
    async ({ agentOwnerId, customerPhone, templateName, variableValues }) => {
        await connectDB();

        try {
            // Get AI agent
            const agent = await AIAgent.findOne({ owner: agentOwnerId }).lean<IAIAgent>();
            if (!agent || !agent.account) {
                return "Error: AI agent or WhatsApp account not found.";
            }

            // Get WhatsApp account
            const waAccount = await WhatsAppAccount.findById(agent.account);
            if (!waAccount || waAccount.status !== "connected") {
                return "Error: WhatsApp account not connected.";
            }

            // Get template
            const template = await Template.findOne({
                owner: new mongoose.Types.ObjectId(agentOwnerId),
                name: templateName,
                status: "APPROVED"
            }).lean<ITemplate>();

            if (!template) {
                return `Error: Template "${templateName}" not found or not approved.`;
            }

            // Decrypt token
            const token = decryptToken(waAccount.waTokenEncrypted);

            // Normalize phone number
            let phone = customerPhone.replace(/\D/g, "");
            if (!phone.startsWith("+")) phone = "+" + phone;

            // Send template message
            await sendTemplateMessage(
                waAccount,
                phone,
                template,
                variableValues || [],
                token
            );

            // Create success notification
            await Notification.create({
                owner: agentOwnerId,
                type: 'agent',
                title: 'AI Agent Sent Template',
                message: `Template "${templateName}" sent successfully to ${phone}.`,
                link: '/dashboard/whatsapp',
                metadata: { 
                    action: 'send_template', 
                    templateName, 
                    customerPhone: phone,
                    success: true 
                },
            });

            return `Successfully sent template "${templateName}" to ${phone}.`;
        } catch (err: any) {
            console.error("Send template tool error:", err);

            // Create failure notification
            await Notification.create({
                owner: agentOwnerId,
                type: 'agent',
                title: 'AI Agent Template Failed',
                message: `Failed to send template "${templateName}" to ${customerPhone}: ${err.message || "Unknown error"}`,
                link: '/dashboard/whatsapp',
                metadata: { 
                    action: 'send_template', 
                    templateName, 
                    customerPhone,
                    success: false,
                    error: err.message 
                },
            });

            return `Error sending template: ${err.message || "Unknown error"}`;
        }
    },
    {
        name: "send_template",
        description: "Send an approved WhatsApp template message to a customer. Use this when you need to send a structured message like order confirmations, promotions, or notifications.",
        schema: z.object({
            agentOwnerId: z.string().describe("Your owner ID"),
            customerPhone: z.string().describe("Customer phone number (with country code, e.g., +1234567890)"),
            templateName: z.string().describe("Name of the approved template to send"),
            variableValues: z.array(z.string()).optional().describe("Array of values to replace template variables ({{1}}, {{2}}, etc.)"),
        }),
    }
);
