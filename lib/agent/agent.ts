import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatMistralAI } from "@langchain/mistralai";
import { MemorySaver } from "@langchain/langgraph";
import AIAgent, { IAIAgent } from "@/models/ai-agent";
import { connectDB } from "../db/mongoDB";
import { orderTools } from "./tools/orderTools"; 
import { searchProductTool } from "./tools/productTools";
import { memoryTools } from "./tools/memory"; 



/** ------------------------------
 * Global AI model and owner checkpoint
 * ------------------------------ */

const tools = [...orderTools, searchProductTool, ...memoryTools];


/** ------------------------------
 * Global AI model and owner checkpoint
 * ------------------------------ */
const model = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
});

const ownerCheckpoint = new MemorySaver();
const customerCheckpoints: Record<string, MemorySaver> = {};

/** ------------------------------
 * Load Owner Agent
 * ------------------------------ */
export async function loadAgent(ownerId: string) {
    await connectDB(); 

    const agentData = await AIAgent.findOne({ owner: ownerId }).lean<IAIAgent>();
    if (!agentData) return null;

    const agent = await createReactAgent({
        llm: model,
        tools,
        checkpointSaver: ownerCheckpoint,
        prompt: `You are talking directly with your OWNER. Base your replies on the owner system prompt: "${agentData.prompt}". Be helpful, professional, and concise.`,
    });

    return { agent, agentData };
}

/** ------------------------------
 * Generate reply from Owner Agent
 * ------------------------------ */
export async function generateAIResponse(ownerId: string, input: string) {
    const result = await loadAgent(ownerId);
    if (!result) return null;

    const { agent, agentData } = result;

    const res = await agent.invoke(
        {
            messages: [{ role: "user", content: input }],
        },
        {
            configurable: {
                thread_id: agentData.account ? `wa-${agentData.account.toString()}` : `wa-${ownerId}`,
                recursionLimit: 5,
            },
        }
    );

    return res.messages?.at(-1)?.content || null;
}

/** ------------------------------
 * Generate reply for Customer
 * ------------------------------ */
export async function generateCustomerAIResponse(ownerId: string, customerPhone: string, input: string) {
    await connectDB();

    const agentData = await AIAgent.findOne({ owner: ownerId }).lean<IAIAgent>();
    if (!agentData) return null;

    const threadId = `wa-${ownerId}-${customerPhone}`;

    // create or reuse checkpoint per customer thread
    let checkpoint = customerCheckpoints[threadId];
    if (!checkpoint) customerCheckpoints[threadId] = checkpoint = new MemorySaver();

    const agent = await createReactAgent({
        llm: model,
        tools,
        checkpointSaver: checkpoint,
        prompt: `You are talking directly with a CUSTOMER of the owner with the number phone ${customerPhone}. 
        Base your replies on the owner system prompt: "${agentData.prompt}". Be polite, helpful, and concise.`,
    });

    const res = await agent.invoke(
        {
            messages: [{ role: "user", content: input }],
        },
        {
            configurable: {
                thread_id: threadId,
                recursionLimit: 5,
            },
        }
    );
    return res.messages?.at(-1)?.content || null;
}
