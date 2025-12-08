
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { connectDB } from "@/lib/db/mongoDB";
import AIAgent from "@/models/automation/ai-agent";
import { ChatMistralAI } from "@langchain/mistralai";

const model = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
});

/**
 * Store owner memory:
 * - Fetches old memory
 * - Uses AI to merge old memory + new info into a short summary
 * - Saves the memory back to the agent
 */
export const storeOwnerMemoryTool = tool(
    async ({ ownerId, newInfo }: { ownerId: string; newInfo: string }) => {
        await connectDB();

        const agent = await AIAgent.findOne({ owner: ownerId });
        if (!agent) return "Agent not found.";

        const oldMemory = agent.memory?.trim() || "";

        const prompt = `You are an AI agent maintaining a short memory about your owner. 
        Merge the old memory with the new information into a concise summary (max 150 words):
        Old memory: "${oldMemory}"
        New information: "${newInfo}"`;

        const updatedSummary = await model.invoke(prompt);
        const summaryText = updatedSummary || newInfo;


        agent.memory = summaryText;
        await agent.save();

        return agent.memory;
    },
    {
        name: "store_owner_memory",
        description: "Store important information about the owner. This memory is never used with customers.",
        schema: z.object({
        ownerId: z.string().describe("The owner's user ID"),
        newInfo: z.string().describe("New important information about the owner to store in memory"),
        }),
    }
);

/**
 * Retrieve owner memory
 * - Fetches the stored memory for the owner
 * - Returns a short, concise summary
 */
export const getOwnerMemoryTool = tool(
    async ({ ownerId }: { ownerId: string }) => {
        await connectDB();

        const agent = await AIAgent.findOne({ owner: ownerId });
        if (!agent) return "Agent not found.";

        // Return memory (may be empty if no info stored yet)
        return agent.memory || "No important information stored about the owner yet.";
    },
    {
        name: "get_owner_memory",
        description: "Retrieve memory about the owner.",
        schema: z.object({
        ownerId: z.string().describe("The owner's user ID"),
        }),
    }
);

export const ownerMemory = [storeOwnerMemoryTool, getOwnerMemoryTool]

