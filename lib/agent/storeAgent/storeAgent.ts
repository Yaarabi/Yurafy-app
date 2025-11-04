import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { connectDB } from "../../db/mongoDB";
import User from "@/models/users";

// ------------------------------
// AI Model Configuration
// ------------------------------
const model = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
});

// ------------------------------
// Response Cache
// ------------------------------
const descriptionCache: Record<string, string> = {};

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
// Generate Store Description
// ------------------------------
export async function generateStoreDescription(
    userId: string,
    storeInfo: {
        brandName: string;
        products?: string[];
        category?: string;
        targetAudience?: string;
        businessType?: string;
    },
    plan?: string
): Promise<string> {
    await connectDB();

    // Get user info for context (verify user exists)
    const user = await User.findById(userId).lean();
    if (!user || Array.isArray(user)) {
        throw new Error("User not found");
    }

    // Create cache key
    const cacheKey = `${userId}-${storeInfo.brandName}-${storeInfo.category || 'general'}`;
    if (descriptionCache[cacheKey]) {
        return descriptionCache[cacheKey];
    }

    // Create prompt for description generation
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", `You are an expert copywriter specializing in writing concise and compelling store descriptions for e-commerce platforms.

Your task: Generate a SHORT and SMART store description that:
- Is between 2-4 sentences (maximum 150 words)
- Clearly describes what the store sells and its unique value proposition
- Is engaging and professional
- Appeals to the target audience
- Includes key information about products/services without being too detailed

Guidelines:
- Be concise but informative
- Use clear, compelling language
- Highlight what makes the store unique
- Focus on benefits, not just features
- Avoid fluff or generic statements
- Make it compelling enough to make visitors want to explore further`],
        ["human", `Generate a short, smart store description for:

Store Name: ${storeInfo.brandName}
${storeInfo.products ? `Products: ${storeInfo.products.join(', ')}` : ''}
${storeInfo.category ? `Category: ${storeInfo.category}` : ''}
${storeInfo.businessType ? `Business Type: ${storeInfo.businessType}` : ''}
${storeInfo.targetAudience ? `Target Audience: ${storeInfo.targetAudience}` : ''}

Write a compelling 2-4 sentence description that clearly explains what this store offers and why customers should shop here.`]
    ]);

    const chain = prompt.pipe(model);
    
    try {
        const response = await chain.invoke({});
        let description = typeof response.content === 'string' 
            ? response.content 
            : (response.content as any)?.text || '';
        
        // Extract just the description text, removing any markdown or formatting
        description = description.trim()
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .replace(/\*\*/g, '') // Remove bold markers
            .replace(/\*/g, '') // Remove italic markers
            .trim();

        // Cache the description
        descriptionCache[cacheKey] = description;
        
        return description;
    } catch (error) {
        console.error('Error generating store description:', error);
        // Return a fallback description
        return `${storeInfo.brandName} offers quality products and excellent customer service. Shop with us for the best selection and deals.`;
    }
}

// ------------------------------
// Generate Store Description (Legacy function for backward compatibility)
// ------------------------------
export async function generateStoreSetupResponse(
    userId: string,
    input: string,
    plan?: string,
    threadId?: string,
    selectedTheme?: { themeId: number; theme: { primaryColor: string; secondaryColor?: string; textColor?: string } } | null,
    selectedThemeStructure?: { header: boolean; hero: boolean; about: boolean; trust: boolean; productGrid: boolean; footer: boolean } | null,
    selectedProductPageStructure?: { productDetails: boolean; productImages: boolean; productDescription: boolean; productPrice: boolean; productVariants: boolean; orderForm: boolean; relatedProducts: boolean; reviews: boolean } | null
): Promise<{ message: string; description?: string }> {
    try {
        // Extract store information from input
        const storeInfo: {
            brandName: string;
            products?: string[];
            category?: string;
            targetAudience?: string;
            businessType?: string;
        } = {
            brandName: extractBrandName(input) || "Store",
            category: extractCategory(input),
            businessType: extractBusinessType(input),
        };

        // Generate description
        const description = await generateStoreDescription(userId, storeInfo, plan);

        return {
            message: description,
            description: description,
        };
    } catch (error) {
        console.error(`Store description generation error for ${userId}:`, error);
        return {
            message: "I apologize, but I encountered an error generating the description. Please try again.",
            description: "",
        };
    }
}

// ------------------------------
// Helper functions to extract store info from input
// ------------------------------
function extractBrandName(input: string): string | null {
    // Try to extract brand name from common patterns
    const patterns = [
        /(?:my|our|the)?\s*(?:store|shop|business|brand)?\s*(?:is|called|named)?\s*["']?([A-Z][a-zA-Z\s&]+)["']?/i,
        /brand[:\s]+["']?([A-Z][a-zA-Z\s&]+)["']?/i,
        /name[:\s]+["']?([A-Z][a-zA-Z\s&]+)["']?/i,
    ];
    
    for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return null;
}

function extractCategory(input: string): string | undefined {
    const categories = ['fashion', 'electronics', 'food', 'beauty', 'health', 'tech', 'clothing', 'accessories'];
    const lowerInput = input.toLowerCase();
    
    for (const category of categories) {
        if (lowerInput.includes(category)) {
            return category;
        }
    }
    
    return undefined;
}

function extractBusinessType(input: string): string | undefined {
    const types = ['retail', 'e-commerce', 'boutique', 'marketplace', 'store'];
    const lowerInput = input.toLowerCase();
    
    for (const type of types) {
        if (lowerInput.includes(type)) {
            return type;
        }
    }
    
    return undefined;
}

// ------------------------------
// Get conversation thread ID
// ------------------------------
export function getThreadId(userId: string): string {
    return `store-setup-${userId}`;
}

