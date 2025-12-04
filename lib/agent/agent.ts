import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatMistralAI } from "@langchain/mistralai";
import { MemorySaver } from "@langchain/langgraph";
import AIAgent, { IAIAgent } from "@/models/ai-agent";
import { connectDB } from "../db/mongoDB";
import { orderTools } from "./tools/orderTools";
import { searchProductTool, listProductsTool } from "./tools/productTools";
import { memoryTools } from "./tools/memory";
import { brandInfoRetrievalTool } from "./tools/ragTool";
import { templateGuideTool, sendTemplateTool } from "./tools/templateTool";

// ------------------------------
// Global AI model and tools
// ------------------------------
const allTools = [...orderTools, searchProductTool, listProductsTool, ...memoryTools, brandInfoRetrievalTool, templateGuideTool, sendTemplateTool];

const model = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
});

// ------------------------------
// Memory and Agent Caches
// ------------------------------
const ownerCheckpoint = new MemorySaver();
// Use MemorySaver for customer agents (DatabaseCheckpointSaver has compatibility issues with LangGraph)
const customerCheckpointSaver = new MemorySaver();
const agentCache: Record<string, Awaited<ReturnType<typeof createReactAgent>>> = {};

// ------------------------------
// Clear agent cache for a specific owner
// ------------------------------
export function clearAgentCache(ownerId: string) {
    // Clear all cache entries for this owner
    Object.keys(agentCache).forEach(key => {
        if (key.startsWith(`${ownerId}-`)) {
            delete agentCache[key];
        }
    });
}

// ------------------------------
// Utility: Sanitize prompt
// ------------------------------
function sanitizePrompt(prompt: string): string {
    return prompt.replace(/["<>]/g, "").trim();
}

// ------------------------------
// Get enabled tools for agent
// ------------------------------
function getEnabledTools(agentData: IAIAgent) {
    // Handle both Map and object formats
    let enabledTools: Record<string, boolean> = {};
    
    if (agentData.enabledTools) {
        if (agentData.enabledTools instanceof Map) {
            // Convert Map to object
            enabledTools = Object.fromEntries(agentData.enabledTools);
        } else if (typeof agentData.enabledTools === 'object') {
            // Already an object
            enabledTools = agentData.enabledTools as Record<string, boolean>;
        }
    }
    
    return allTools.filter(tool => {
        const toolName = tool.name;
        // If tool is not in enabledTools, default to enabled (backward compatibility)
        return enabledTools[toolName] !== false;
    });
}

// ------------------------------
// Load Owner Agent (cached)
// ------------------------------
export async function loadAgent(ownerId: string) {
    await connectDB();

    const agentData = await AIAgent.findOne({ owner: ownerId }).lean<IAIAgent>();
    if (!agentData) return null;

    // Normalize enabledTools to object for cache key generation
    let enabledToolsObj: Record<string, boolean> = {};
    if (agentData.enabledTools) {
        if (agentData.enabledTools instanceof Map) {
            enabledToolsObj = Object.fromEntries(agentData.enabledTools);
        } else if (typeof agentData.enabledTools === 'object') {
            enabledToolsObj = agentData.enabledTools as Record<string, boolean>;
        }
    }

    // Check cache with enabled tools (sorted keys for consistent cache key)
    const cacheKey = `${ownerId}-${JSON.stringify(Object.keys(enabledToolsObj).sort().reduce((acc, key) => {
        acc[key] = enabledToolsObj[key];
        return acc;
    }, {} as Record<string, boolean>))}`;
    
    if (agentCache[cacheKey]) {
        return { agent: agentCache[cacheKey], agentData };
    }

    const safePrompt = sanitizePrompt(agentData.prompt);
    const enabledTools = getEnabledTools(agentData);

    const agent = await createReactAgent({
        llm: model,
        tools: enabledTools,
        checkpointSaver: ownerCheckpoint,
        prompt: `You are talking directly with your OWNER. Base your replies on the owner system prompt: "${safePrompt}".
            Your owner id is ${agentData.owner}. Be helpful, professional, and concise.`,
    });

    agentCache[cacheKey] = agent;
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

        // Use MemorySaver for customer agents (in-memory checkpoints)
        // Note: Checkpoints will be lost on server restart, but this ensures compatibility
        const safePrompt = sanitizePrompt(agentData.prompt);
        const enabledTools = getEnabledTools(agentData);

        const agent = await createReactAgent({
        llm: model,
        tools: enabledTools,
        checkpointSaver: customerCheckpointSaver,
        prompt: `You are talking directly with a CUSTOMER of your owner with the phone number ${customerPhone}.
            Base your replies on the owner system prompt: "${safePrompt}". Your owner id is ${agentData.owner}. Be polite, helpful, and concise.`,
        });

        const res = await agent.invoke(
        { messages: [{ role: "user", content: input }] },
        {
            configurable: {
            thread_id: threadId,
            recursionLimit: 8, // ✅ Increased from 5 for complex queries
            },
        }
        );

        return res.messages?.at(-1)?.content || "No response generated.";
    } catch (err) {
        console.error(`Customer agent error for ${ownerId} / ${customerPhone}:`, err);
        // ✅ FIXED: Re-throw error for proper error handling upstream
        throw err;
    }
}
