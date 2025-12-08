import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppConversation, { IWhatsAppMessage, IWhatsAppConversation } from "@/models/automation/whatsappMessage";

/**
 * 🧠 Retrieve the conversation history (memory) for a specific customer
 * Uses the WhatsApp messages as the memory source
 */
export const getAgentMemoryTool = tool(
    async ({ ownerId, customerPhone, limit = 20 }) => {
        await connectDB();

        const conversation = await WhatsAppConversation.findOne({
            owner: new mongoose.Types.ObjectId(ownerId),
            "customer.phone": customerPhone,
        }).lean<IWhatsAppConversation>();

        if (!conversation) {
            return `❌ No conversation found for ${customerPhone}.`;
        }

        // Get the latest messages (most recent first, then reverse for chronological order)
        const messages = conversation.messages
            .slice(-limit)
            .map((msg: IWhatsAppMessage) => {
                const direction = msg.direction === "incoming" ? "Customer" : "Agent";
                const time = new Date(msg.timestamp).toLocaleString();
                const content = msg.text || `[${msg.type}]`;
                const aiTag = msg.isAIResponse ? " (AI)" : "";
                return `[${time}] ${direction}${aiTag}: ${content}`;
            })
            .join("\n");

        if (!messages) {
            return `❌ No messages found for ${customerPhone}.`;
        }

        const customerName = conversation.customer?.name || customerPhone;
        return `📝 Conversation history with ${customerName}:\n\n${messages}`;
    },
    {
        name: "get_agent_memory",
        description:
            "Retrieve the conversation history with a specific customer. Returns the latest messages as context/memory.",
        schema: z.object({
            ownerId: z.string().describe("The ID of your owner"),
            customerPhone: z.string().describe("The customer's phone number"),
            limit: z.number().optional().default(20).describe("Number of recent messages to retrieve (default: 20)"),
        }),
    }
);

export const memoryTools = [getAgentMemoryTool];
