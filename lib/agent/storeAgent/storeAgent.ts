import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatMistralAI } from "@langchain/mistralai";
import { MemorySaver } from "@langchain/langgraph";
import { saveStoreTool } from "./tools";
import { connectDB } from "../../db/mongoDB";
import User from "@/models/users";

// ------------------------------
// Store Setup Agent Tools
// ------------------------------
const storeAgentTools = [saveStoreTool];

// ------------------------------
// AI Model Configuration
// ------------------------------
const model = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
});

// ------------------------------
// Memory and Agent Caches
// ------------------------------
const storeAgentCheckpoint = new MemorySaver();
const storeAgentCache: Record<string, Awaited<ReturnType<typeof createReactAgent>>> = {};

// ------------------------------
// Utility: Sanitize prompt
// ------------------------------
function sanitizePrompt(prompt: string): string {
    return prompt.replace(/["<>]/g, "").trim();
}

// ------------------------------
// Generate domain slug from brand name
// ------------------------------
function generateDomain(brandName: string): string {
    return brandName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// ------------------------------
// Load or Create Store Setup Agent
// ------------------------------
export async function loadStoreAgent(userId: string, plan?: string) {
    await connectDB();

    // Use cached agent if available
    const cacheKey = `${userId}-${plan || 'default'}`;
    if (storeAgentCache[cacheKey]) {
        return storeAgentCache[cacheKey];
    }

    // Get user info for context
    const user = await User.findById(userId).lean();
    if (!user || Array.isArray(user)) {
        throw new Error("User not found");
    }
    
    const userData = user as any;

    // Create agent system prompt
    const systemPrompt = `You are a friendly and helpful store setup assistant for an e-commerce platform. Your role is to guide users through setting up their online store.

User Information:
- Username: ${userData.username}
- Email: ${userData.email}
- Plan: ${plan || 'Not specified'}

Your capabilities:
1. Ask questions about their business to understand what they need
2. Extract information about:
   - Business name and brand identity
   - Products or services they sell
   - Target audience
   - Business category/niche
   - Social media presence
   - Design preferences

3. Suggest appropriate values for:
   - Brand name (based on their business description)
   - Domain/slug (auto-generate from brand name, lowercase, hyphenated)
   - Store description
   - Theme colors (suggest colors that match their business type)
   - Hero section content
   - Social media links (if mentioned)
   - SEO information
   - Whether Cash on Delivery (COD) should be enabled

4. Use the save_store tool ONLY when:
   - You have collected sufficient information (at minimum: brandName and domain)
   - The user explicitly confirms they want to create the store
   - You have asked "Would you like me to create your store with these details?" and they said yes

Guidelines:
- Be conversational and friendly
- Ask one or two questions at a time (don't overwhelm)
- When generating domain slugs, make them SEO-friendly (lowercase, hyphens, no special chars)
- Suggest appropriate theme colors based on business type:
  * Fashion/Beauty: Elegant colors (purple, pink, gold)
  * Tech/Electronics: Modern colors (blue, cyan, dark)
  * Food/Beverage: Warm colors (orange, red, yellow, green)
  * Health/Wellness: Natural colors (green, blue, white)
  * General: Professional colors (blue, indigo, gray)
- Always confirm with the user before using save_store tool
- When confirming details, explicitly include whether COD (Cash on Delivery) is enabled or disabled
- If domain is already taken, suggest alternatives

Remember: Only save the store when the user explicitly confirms!`;

    const safePrompt = sanitizePrompt(systemPrompt);

    // Create the agent
    const agent = await createReactAgent({
        llm: model,
        tools: storeAgentTools,
        checkpointSaver: storeAgentCheckpoint,
        prompt: safePrompt,
    });

    // Cache the agent
    storeAgentCache[cacheKey] = agent;

    return agent;
}

// ------------------------------
// Generate AI Response for Store Setup
// ------------------------------
export async function generateStoreSetupResponse(
    userId: string,
    input: string,
    plan?: string,
    threadId?: string
): Promise<string> {
    try {
        const agent = await loadStoreAgent(userId, plan);

        // Use thread ID for conversation continuity
        const conversationThreadId = threadId || `store-setup-${userId}-${Date.now()}`;

        // Add user context to the input
        const enhancedInput = input;

        const result = await agent.invoke(
            {
                messages: [
                    {
                        role: "user",
                        content: enhancedInput,
                    },
                ],
            },
            {
                configurable: {
                    thread_id: conversationThreadId,
                    recursionLimit: 10,
                },
            }
        );

        // Get the last message from the agent
        const lastMessage = result.messages?.at(-1);
        const response = lastMessage?.content || "I'm here to help you set up your store. What's your business name or what products do you sell?";

        return response;
    } catch (error) {
        console.error(`Store setup agent error for ${userId}:`, error);
        return "I apologize, but I encountered an error. Please try again or contact support.";
    }
}

// ------------------------------
// Get conversation thread ID
// ------------------------------
export function getThreadId(userId: string): string {
    return `store-setup-${userId}`;
}

