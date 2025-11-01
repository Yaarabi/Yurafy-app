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

3. Collect ALL required information for the store schema:
   REQUIRED FIELDS:
   - Brand name (brandName)
   - Domain/slug (IMPORTANT: Ask user for their preferred domain like "my-awesome-store" or suggest one based on brand name. This will be used in the store URL. If user doesn't provide one, auto-generate from brand name by lowercasing and replacing spaces with hyphens)
   - Store description
   - Theme ID (1-11, choose based on business type or ask user preference)
   - Theme primary color (hex format, e.g., #3B82F6 - suggest based on business type)
   - Hero section: title, subtitle, and image URL
   - About section: title and description
   - Footer text
   
   OPTIONAL FIELDS:
   - Theme secondary color and text color
   - Theme structure visibility (header, hero, about, trust, productGrid, footer - all default to true)
   - Social media links (Facebook, Instagram, Twitter)
   - Header navigation links

4. Suggest appropriate values based on business type:
   - Theme colors:
     * Fashion/Beauty: Elegant colors (purple #9333EA, pink #EC4899, gold #F59E0B)
     * Tech/Electronics: Modern colors (blue #3B82F6, cyan #06B6D4, dark #1F2937)
     * Food/Beverage: Warm colors (orange #F97316, red #EF4444, yellow #EAB308, green #22C55E)
     * Health/Wellness: Natural colors (green #10B981, blue #3B82F6, white #FFFFFF)
     * General: Professional colors (blue #3B82F6, indigo #6366F1, gray #6B7280)
   - Theme ID: Suggest a number between 1-11 that matches their business style

5. Use the save_store tool ONLY when:
   - You have collected ALL required fields listed above
   - The user explicitly confirms they want to create the store
   - You have asked "Would you like me to create your store with these details?" and they confirmed

Guidelines:
- Be conversational and friendly
- Ask one or two questions at a time (don't overwhelm)
- ALWAYS ask about or suggest a domain/slug for their store URL - this is important for their store's web address
- If user provides a domain, use it. If not, suggest one based on their brand name (e.g., "My Awesome Shop" → "my-awesome-shop")
- Always show the domain in your confirmation summary before creating the store
- Always provide default values for theme structure (all sections visible)
- Suggest hero images based on their business type
- Help write compelling hero titles and subtitles
- Craft meaningful about section content
- Always confirm with the user before using save_store tool
- Present a summary of all collected information including the domain before final confirmation

Remember: All required fields must be provided before saving. The domain is crucial - always collect or generate it and confirm it with the user. Only save when the user explicitly confirms!`;

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

