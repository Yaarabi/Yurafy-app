
// File: templateGuideTool.ts

import mongoose from "mongoose";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { connectDB } from "@/lib/db/mongoDB";
import AIAgent, { IAIAgent } from "@/models/ai-agent";
import Template from "@/models/templates";

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
