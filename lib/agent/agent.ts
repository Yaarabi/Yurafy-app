import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatMistralAI } from "@langchain/mistralai";
import { MemorySaver } from "@langchain/langgraph";
import AIAgent, { IAIAgent } from "@/models/ai-agent";
import { connectDB } from "../db/mongoDB";
import { orderTools } from "./tools/orderTools";
import { searchProductTool } from "./tools/productTools";
import { memoryTools } from "./tools/memory";
import { brandInfoRetrievalTool } from "./tools/ragTool";
import { templateGuideTool } from "./tools/templateTool";

// ------------------------------
// Global AI model and tools
// ------------------------------
const tools = [...orderTools, searchProductTool, ...memoryTools, brandInfoRetrievalTool, templateGuideTool
    
];

const model = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
});

// ------------------------------
// Memory and Agent Caches
// ------------------------------
const ownerCheckpoint = new MemorySaver();
const customerCheckpoints: Record<string, MemorySaver> = {};
const agentCache: Record<string, Awaited<ReturnType<typeof createReactAgent>>> = {};

// ------------------------------
// Utility: Sanitize prompt
// ------------------------------
function sanitizePrompt(prompt: string): string {
    return prompt.replace(/["<>]/g, "").trim();
}

// ------------------------------
// Load Owner Agent (cached)
// ------------------------------
export async function loadAgent(ownerId: string) {
    await connectDB();

    if (agentCache[ownerId]) return { agent: agentCache[ownerId], agentData: await AIAgent.findOne({ owner: ownerId }).lean<IAIAgent>() };

    const agentData = await AIAgent.findOne({ owner: ownerId }).lean<IAIAgent>();
    if (!agentData) return null;

    const safePrompt = sanitizePrompt(agentData.prompt);

    const agent = await createReactAgent({
        llm: model,
        tools,
        checkpointSaver: ownerCheckpoint,
        prompt: `You are talking directly with your OWNER. Base your replies on the owner system prompt: "${safePrompt}".
            Your owner id is ${agentData.owner}. Be helpful, professional, and concise.`,
    });

    agentCache[ownerId] = agent;
    return { agent, agentData };
}

// ------------------------------
// Generate reply from Owner Agent
// ------------------------------
export async function generateAIResponse(ownerId: string, input: string) {
    try {
        const result = await loadAgent(ownerId);
        if (!result || !result.agentData) return "Agent not found.";

        const { agent, agentData } = result;

        const threadId = agentData.account ? `wa-${agentData.account}` : `wa-${ownerId}`;

        const res = await agent.invoke(
        { messages: [{ role: "user", content: input }] },
        {
            configurable: {
            thread_id: threadId,
            recursionLimit: 5,
            },
        }
        );

        return res.messages?.at(-1)?.content || "No response generated.";
    } catch (err) {
        console.error(`Owner agent error for ${ownerId}:`, err);
        return "Sorry, something went wrong while generating the response.";
    }
}

// ------------------------------
// Generate reply for Customer
// ------------------------------
export async function generateCustomerAIResponse(ownerId: string, customerPhone: string, input: string) {
    try {
        await connectDB();

        const agentData = await AIAgent.findOne({ owner: ownerId }).lean<IAIAgent>();
        if (!agentData) return "Agent not found.";

        const threadId = `wa-${ownerId}-${customerPhone}`;

        // Create or reuse checkpoint per customer thread
        let checkpoint = customerCheckpoints[threadId];
        if (!checkpoint) customerCheckpoints[threadId] = checkpoint = new MemorySaver();

        const safePrompt = sanitizePrompt(agentData.prompt);

        const agent = await createReactAgent({
        llm: model,
        tools,
        checkpointSaver: checkpoint,
        prompt: `You are talking directly with a CUSTOMER of your owner with the phone number ${customerPhone}.
            Base your replies on the owner system prompt: "${safePrompt}". Your owner id is ${agentData.owner}. Be polite, helpful, and concise.`,
        });

        const res = await agent.invoke(
        { messages: [{ role: "user", content: input }] },
        {
            configurable: {
            thread_id: threadId,
            recursionLimit: 5,
            },
        }
        );

        return res.messages?.at(-1)?.content || "No response generated.";
    } catch (err) {
        console.error(`Customer agent error for ${ownerId} / ${customerPhone}:`, err);
        return "Sorry, something went wrong while generating the response.";
    }
}
