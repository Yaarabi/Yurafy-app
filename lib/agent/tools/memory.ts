import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoDB";
import AgentMemory, { IAgentMemory } from "@/models/agentMemory";

/**
 * 🧠 Store or update the memory of an AI agent about a specific customer.
 * - If no record exists for this (owner + customer), create one.
 * - If it exists, append the new summary to the previous one.
 */
export const storeAgentActionTool = tool(
    async ({ ownerId, customerPhone, customerName, summary }) => {
        await connectDB();

        const cleanSummary = summary.trim();
        if (!cleanSummary) return "⚠️ Cannot store an empty summary.";

        const timestamp = new Date().toISOString();
        const entry = `🕒 ${timestamp}\n${cleanSummary}`;

        const existing = await AgentMemory.findOne({
        owner: new mongoose.Types.ObjectId(ownerId),
        customerPhone,
        });

        if (existing) {
        existing.summary = `${existing.summary}\n\n${entry}`;
        if (customerName && !existing.customerName) {
            existing.customerName = customerName;
        }
        await existing.save();

        return `✅ Memory updated for ${existing.customerName || customerPhone}.`;
        } else {
        const memory = await AgentMemory.create({
            owner: new mongoose.Types.ObjectId(ownerId),
            customerPhone,
            customerName,
            summary: entry,
        });

        return `🧠 New memory created for ${customerName || customerPhone}.`;
        }
    },
    {
        name: "store_agent_action",
        description:
        "Store or update what the AI agent did or observed about a customer. If a memory exists, the new info is appended.",
        schema: z.object({
        ownerId: z.string().describe("The ID of your owner"),
        customerPhone: z.string().describe("The customer's phone number"),
        customerName: z.string().optional().describe("The customer's name, if known"),
        summary: z
            .string()
            .describe("A summary of the agent's new action or the customer's situation"),
        }),
    }
);

/**
 * 🧠 Retrieve memory for a specific customer
 */
export const getAgentMemoryTool = tool(
    async ({ ownerId, customerPhone }) => {
        await connectDB();

        const memory = await AgentMemory.findOne({
        owner: new mongoose.Types.ObjectId(ownerId),
        customerPhone,
        }).lean<IAgentMemory>();

        if (!memory) return `❌ No memory found for ${customerPhone}.`;

        return memory.summary;
    },
    {
        name: "get_agent_memory",
        description:
        "Retrieve the stored summary of previous actions or customer situations for a specific customer.",
        schema: z.object({
        ownerId: z.string().describe("The ID of your owner"),
        customerPhone: z.string().describe("The customer's phone number"),
        }),
    }
);

export const memoryTools = [storeAgentActionTool, getAgentMemoryTool];
