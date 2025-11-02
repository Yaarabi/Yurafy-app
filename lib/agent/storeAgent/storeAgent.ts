import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatMistralAI } from "@langchain/mistralai";
import { MemorySaver } from "@langchain/langgraph";
import { saveStoreTool } from "./tools";
import { showComponentTool, hideComponentTool } from "./uiTools";
import { connectDB } from "../../db/mongoDB";
import User from "@/models/users";

// ------------------------------
// Store Setup Agent Tools
// ------------------------------
const storeAgentTools = [saveStoreTool, showComponentTool, hideComponentTool];

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
export async function loadStoreAgent(userId: string, plan?: string, selectedTheme?: { themeId: number; theme: { primaryColor: string; secondaryColor?: string; textColor?: string } } | null, selectedThemeStructure?: { header: boolean; hero: boolean; about: boolean; trust: boolean; productGrid: boolean; footer: boolean } | null, selectedProductPageStructure?: { productDetails: boolean; productImages: boolean; productDescription: boolean; productPrice: boolean; productVariants: boolean; orderForm: boolean; relatedProducts: boolean; reviews: boolean } | null) {
    await connectDB();

    // Use cached agent if available (include theme, structure, and product page structure in cache key to avoid conflicts)
    const structureKey = selectedThemeStructure ? Object.values(selectedThemeStructure).join('-') : 'default';
    const productPageStructureKey = selectedProductPageStructure ? Object.values(selectedProductPageStructure).join('-') : 'default';
    const cacheKey = `${userId}-${plan || 'default'}-${selectedTheme?.themeId || 'no-theme'}-${structureKey}-${productPageStructureKey}`;
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
    const themeInfo = selectedTheme 
        ? `\nIMPORTANT: The user has already selected Theme #${selectedTheme.themeId}. When creating the store, use:\n- themeId: ${selectedTheme.themeId}\n- theme.primaryColor: ${selectedTheme.theme.primaryColor}\n${selectedTheme.theme.secondaryColor ? `- theme.secondaryColor: ${selectedTheme.theme.secondaryColor}\n` : ''}${selectedTheme.theme.textColor ? `- theme.textColor: ${selectedTheme.theme.textColor}\n` : ''}DO NOT ask about theme selection - it's already chosen.`
        : '';

    const themeStructureInfo = selectedThemeStructure
        ? `\nIMPORTANT: The user has already configured the store structure:\n- header: ${selectedThemeStructure.header}\n- hero: ${selectedThemeStructure.hero}\n- about: ${selectedThemeStructure.about}\n- trust: ${selectedThemeStructure.trust}\n- productGrid: ${selectedThemeStructure.productGrid}\n- footer: ${selectedThemeStructure.footer}\nUse this exact structure when creating the store - DO NOT ask about or modify these settings.`
        : '';

    const productPageStructureInfo = selectedProductPageStructure
        ? `\nIMPORTANT: The user has already configured the product page structure:\n- productDetails: ${selectedProductPageStructure.productDetails}\n- productImages: ${selectedProductPageStructure.productImages}\n- productDescription: ${selectedProductPageStructure.productDescription}\n- productPrice: ${selectedProductPageStructure.productPrice}\n- productVariants: ${selectedProductPageStructure.productVariants}\n- orderForm: ${selectedProductPageStructure.orderForm}\n- relatedProducts: ${selectedProductPageStructure.relatedProducts}\n- reviews: ${selectedProductPageStructure.reviews}\nThese settings will be applied to all product pages - DO NOT ask about or modify these settings.`
        : '';

    const systemPrompt = `You are a friendly and helpful store setup assistant for an e-commerce platform. Your role is to guide users through setting up their online store.

User Information:
- User ID: ${userId} (IMPORTANT: Use this exact value as "ownerId" when calling the save_store tool)
- Username: ${userData.username}
- Email: ${userData.email}
- Plan: ${plan || 'Not specified'}${themeInfo}${themeStructureInfo}${productPageStructureInfo}

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
   - Store description` + 
   (selectedTheme 
       ? `\n   - Theme ID: ${selectedTheme.themeId} (ALREADY SELECTED - use this, don't ask)\n   - Theme primary color: ${selectedTheme.theme.primaryColor} (ALREADY SELECTED - use this, don't ask)`
       : `\n   - Theme ID (1-11, choose based on business type or ask user preference)\n   - Theme primary color (hex format, e.g., #3B82F6 - suggest based on business type)`) + 
   (selectedThemeStructure 
       ? `\n   - Theme structure: ALREADY CONFIGURED - use exactly: header=${selectedThemeStructure.header}, hero=${selectedThemeStructure.hero}, about=${selectedThemeStructure.about}, trust=${selectedThemeStructure.trust}, productGrid=${selectedThemeStructure.productGrid}, footer=${selectedThemeStructure.footer} (don't ask about this)`
       : `\n   - Theme structure visibility (header, hero, about, trust, productGrid, footer - all default to true)`) + `
   - Hero section: title, subtitle, and image URL
   - About section: title and description
   - Footer text
   
   OPTIONAL FIELDS:
   - Theme secondary color and text color
   - Social media links (Facebook, Instagram, Twitter)
   - Header navigation links
` +
    (selectedTheme 
        ? `\n   - Note: Theme is already selected (Theme #${selectedTheme.themeId}), so don't suggest or ask about themes`
        : `\n   - Theme colors:
     * Fashion/Beauty: Elegant colors (purple #9333EA, pink #EC4899, gold #F59E0B)
     * Tech/Electronics: Modern colors (blue #3B82F6, cyan #06B6D4, dark #1F2937)
     * Food/Beverage: Warm colors (orange #F97316, red #EF4444, yellow #EAB308, green #22C55E)
     * Health/Wellness: Natural colors (green #10B981, blue #3B82F6, white #FFFFFF)
     * General: Professional colors (blue #3B82F6, indigo #6366F1, gray #6B7280)
   - Theme ID: Suggest a number between 1-16 that matches their business style`);

    const systemPromptContinuation = `
5. UI Component Tools - CRITICAL RULES:
   - You MUST use the "show_component" tool when asked to show/preview store data - DO NOT just describe it in text
   - Use "show_component" with componentId="store_preview" to show a preview of collected store information (during collection)
   - Use "show_component" with componentId="store_summary" to show a comprehensive summary before creating the store
   - Use "show_component" with componentId="store_preview_edit" to show the final preview with edit options (USE THIS when you have collected ALL required information - this allows the user to review and edit before saving)
   - Use "show_component" with componentId="confirmation_ui" to show a confirmation dialog before creating the store
   - MANDATORY: When a user asks you to "generate store content and show in preview" or "show preview", you MUST call show_component tool with componentId="store_preview_edit" and pass ALL the store data in the data parameter as a JSON object. DO NOT just write a text description - you MUST call the tool with the actual data.
   - IMPORTANT: When you have collected ALL required information (brandName, domain, description, hero, about, footer), use show_component with componentId="store_preview_edit" and pass ALL collected store data in the data parameter. This will show the user a preview where they can edit any field before final submission.
   - If a user's prompt explicitly says "show in preview" or "display in store_preview_edit", you MUST call the tool, not just describe the content.

6. Use the save_store tool ONLY when:
   - You have collected ALL required fields listed above
   - You have shown the store_preview_edit using show_component tool
   - The user has reviewed and edited (if needed) the store information in the preview
   - The user explicitly confirms they want to create/save the store (e.g., "yes", "save it", "let's do it", "create it")
   - CRITICAL: When calling save_store, use the User ID from the User Information section above as the ownerId parameter. DO NOT leave ownerId empty or use a placeholder.

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
- IMPORTANT: Once you've shown the store_preview_edit component, do NOT ask for confirmation again with the same message. The user will see confirmation buttons in the UI. Only use save_store when they explicitly confirm through the buttons or say "yes", "save", "create", etc. Avoid repeating the same confirmation message multiple times.

Remember: All required fields must be provided before saving. The domain is crucial - always collect or generate it and confirm it with the user. Only save when the user explicitly confirms!`;

    const fullSystemPrompt = systemPrompt + systemPromptContinuation;
    const safePrompt = sanitizePrompt(fullSystemPrompt);

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
    threadId?: string,
    selectedTheme?: { themeId: number; theme: { primaryColor: string; secondaryColor?: string; textColor?: string } } | null,
    selectedThemeStructure?: { header: boolean; hero: boolean; about: boolean; trust: boolean; productGrid: boolean; footer: boolean } | null,
    selectedProductPageStructure?: { productDetails: boolean; productImages: boolean; productDescription: boolean; productPrice: boolean; productVariants: boolean; orderForm: boolean; relatedProducts: boolean; reviews: boolean } | null
): Promise<{ message: string; uiAction?: { action: string; componentId: string; data?: any } | null; storeData?: any; showPreviewEdit?: boolean }> {
    try {
        const agent = await loadStoreAgent(userId, plan, selectedTheme, selectedThemeStructure, selectedProductPageStructure);

        // Use thread ID for conversation continuity
        const conversationThreadId = threadId || `store-setup-${userId}-${Date.now()}`;

        // Add theme, structure, and product page structure context to the input if pre-selected
        let enhancedInput = input;
        if (selectedTheme || selectedThemeStructure || selectedProductPageStructure) {
            let contextParts: string[] = [];
            if (selectedTheme) {
                contextParts.push(`Theme #${selectedTheme.themeId} with primary color ${selectedTheme.theme.primaryColor} - use themeId ${selectedTheme.themeId} and colors: primaryColor=${selectedTheme.theme.primaryColor}${selectedTheme.theme.secondaryColor ? `, secondaryColor=${selectedTheme.theme.secondaryColor}` : ''}${selectedTheme.theme.textColor ? `, textColor=${selectedTheme.theme.textColor}` : ''}`);
            }
            if (selectedThemeStructure) {
                contextParts.push(`Store structure configured: header=${selectedThemeStructure.header}, hero=${selectedThemeStructure.hero}, about=${selectedThemeStructure.about}, trust=${selectedThemeStructure.trust}, productGrid=${selectedThemeStructure.productGrid}, footer=${selectedThemeStructure.footer} - use this exact structure`);
            }
            if (selectedProductPageStructure) {
                contextParts.push(`Product page structure configured: productDetails=${selectedProductPageStructure.productDetails}, productImages=${selectedProductPageStructure.productImages}, orderForm=${selectedProductPageStructure.orderForm}, etc. - these settings will be applied to all product pages`);
            }
            enhancedInput = `[User has pre-selected: ${contextParts.join('. ')}. DO NOT ask about these - use them as configured.] ${input}`;
        }

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
        let response = lastMessage?.content || "I'm here to help you set up your store. What's your business name or what products do you sell?";
        
        // If response is an array (can happen with tool calls), extract the text
        if (Array.isArray(response)) {
            const textParts = response.filter((item: any) => typeof item === 'string' || item?.type === 'text');
            response = textParts.map((item: any) => typeof item === 'string' ? item : item?.text || '').join(' ') || (typeof response[0] === 'string' ? response[0] : '');
        }

        // Check if agent used any UI tools (show_component or hide_component)
        let uiAction: { action: string; componentId: string; data?: any } | null = null;
        
        // Look for tool calls in ALL messages (tool calls can be in intermediate messages)
        const toolCalls = (result.messages || []).filter((msg: any) => {
            return msg.additional_kwargs?.tool_calls || 
                   msg.tool_calls ||
                   (Array.isArray(msg.content) && msg.content.some((c: any) => c?.type === 'tool_use' || c?.type === 'tool-call'));
        });

        let storeData: any = null;
        let showPreviewEdit = false;

        for (const toolCall of toolCalls) {
            const calls = (toolCall as any).tool_calls || toolCall.additional_kwargs?.tool_calls || [];
            for (const call of calls) {
                if (call.function?.name === 'show_component') {
                    try {
                        const args = JSON.parse(call.function.arguments || '{}');
                        uiAction = {
                            action: 'show',
                            componentId: args.componentId,
                            data: args.data,
                        };
                        // If showing preview with edit, extract store data
                        if (args.componentId === 'store_preview_edit' && args.data) {
                            storeData = args.data;
                            showPreviewEdit = true;
                        }
                        // Also extract store data if showing regular preview
                        if ((args.componentId === 'store_preview' || args.componentId === 'store_summary') && args.data) {
                            storeData = args.data;
                        }
                    } catch (e) {
                        console.error('Error parsing show_component args:', e);
                        // Invalid JSON, skip
                    }
                } else if (call.function?.name === 'hide_component') {
                    try {
                        const args = JSON.parse(call.function.arguments || '{}');
                        uiAction = {
                            action: 'hide',
                            componentId: args.componentId,
                        };
                    } catch (e) {
                        // Invalid JSON, skip
                    }
                } else if (call.function?.name === 'save_store') {
                    // Extract store data from save_store tool call if available
                    try {
                        const args = JSON.parse(call.function.arguments || '{}');
                        if (args.brandName && args.domain) {
                            storeData = {
                                brandName: args.brandName,
                                domain: args.domain,
                                description: args.description,
                                themeId: args.themeId,
                                theme: args.theme,
                                themeStructure: args.themeStructure,
                                hero: args.hero,
                                about: args.about,
                                footer: args.footer,
                                socialLinks: args.socialLinks,
                                headerLinks: args.headerLinks,
                            };
                        }
                    } catch (e) {
                        // Invalid JSON, skip
                    }
                }
            }
        }

        return {
            message: response,
            uiAction,
            storeData,
            showPreviewEdit,
        };
    } catch (error) {
        console.error(`Store setup agent error for ${userId}:`, error);
        return {
            message: "I apologize, but I encountered an error. Please try again or contact support.",
            uiAction: null,
        };
    }
}

// ------------------------------
// Get conversation thread ID
// ------------------------------
export function getThreadId(userId: string): string {
    return `store-setup-${userId}`;
}

