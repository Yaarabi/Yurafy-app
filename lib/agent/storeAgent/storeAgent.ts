import { ChatMistralAI } from "@langchain/mistralai";

/**
 * ✅ Mistral AI Agent for Store Content Generation
 * Generates hero, about, and footer content for stores
 */

const model = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
});

/**
 * Generate store content using Mistral AI
 * @param brandName - Brand name
 * @param description - Store description
 * @returns Generated content (hero, about, footer)
 */
export async function generateStoreContent(
    brandName: string,
    description: string,
    language: string = 'en'
): Promise<{
    hero: {
        title: string;
        subtitle: string;
        imageUrl: string;
    };
    about: {
        title: string;
        description: string;
    };
    footer: {
        text: string;
    };
}> {
    try {
        // Map language codes to language names for the prompt
        const languageMap: Record<string, string> = {
            'en': 'English',
            'fr': 'French',
            'ar': 'Arabic'
        };
        const languageName = languageMap[language] || 'English';
        
        const prompt = `You are a professional copywriter specializing in concise, impactful brand descriptions. Generate compelling store content for a business. IMPORTANT: Generate ALL content in ${languageName} language.

Business Information:
- Brand Name: ${brandName}
- Description: ${description}
- Language: ${languageName}

Generate the following content:

1. Hero Section:
   - Title: Create a compelling, professional headline (5-10 words, engaging and brand-focused)
   - Subtitle: Create a catchy tagline or value proposition (10-20 words, persuasive and clear)
   - Image URL: Suggest a relevant Unsplash image URL based on the business type (format: https://images.unsplash.com/photo-...)

2. About Section:
   - Title: "About ${brandName}" or similar professional title
   - Description: Create a SHORT but SOLID description (40-70 words) that effectively captures the brand essence. Based on "${description}", craft a concise, professional, and compelling description that:
     * Clearly communicates what ${brandName} does and stands for
     * Highlights what makes the brand unique or valuable
     * Is impactful and memorable despite being brief
     * Avoids fluff - every word should add value
     * Focuses on core value proposition and brand identity
     The description should be substantial enough to understand the brand but concise enough to maintain reader engagement.

3. Footer Section:
   - Text: Create a professional footer text that includes copyright information and brand name. Should be concise (10-20 words) and professional. Format: "© ${new Date().getFullYear()} ${brandName}. All rights reserved." or a similar professional footer message in ${languageName} language. The footer should be localized to ${languageName} if the language is not English.

CRITICAL: Keep descriptions concise but meaningful. Quality over quantity - make every word count.

Respond ONLY with a valid JSON object in this exact format (replace placeholder values with actual generated content):
{
  "hero": {
    "title": "compelling headline here (5-10 words)",
    "subtitle": "catchy tagline here (10-20 words)",
    "imageUrl": "https://images.unsplash.com/photo-... (valid Unsplash URL)"
  },
  "about": {
    "title": "About ${brandName} (or similar professional title)",
    "description": "40-70 word concise but solid description here"
  },
  "footer": {
    "text": "Professional footer text with copyright and brand name (10-20 words, in ${languageName} language)"
  }
}

IMPORTANT: 
- All text must be in ${languageName} language
- Footer text should include copyright year (${new Date().getFullYear()}) and brand name (${brandName})
- Do not include any other text outside the JSON object
- Ensure all JSON is valid and properly formatted`;

        const response = await model.invoke(prompt);
        
        // Extract text from Mistral response (LangChain format)
        let text = '';
        if (typeof response.content === 'string') {
            text = response.content;
        } else if (Array.isArray(response.content)) {
            text = response.content.map((item: any) => {
                if (typeof item === 'string') return item;
                if (item && typeof item === 'object' && 'text' in item) {
                    return (item as { text: string }).text;
                }
                return String(item);
            }).join('');
        } else {
            // Fallback: try to get text from response object
            const responseAny = response as any;
            if (responseAny.text) {
                text = responseAny.text;
            } else if (responseAny.content) {
                text = String(responseAny.content);
            } else {
                text = String(response);
            }
        }

        // Extract JSON from response (handle markdown code blocks if present)
        let jsonText = text.trim();
        
        // Remove markdown code blocks if present
        if (jsonText.includes("```json")) {
            const jsonStart = jsonText.indexOf("```json") + 7;
            const jsonEnd = jsonText.indexOf("```", jsonStart);
            if (jsonEnd !== -1) {
                jsonText = jsonText.substring(jsonStart, jsonEnd).trim();
            }
        } else if (jsonText.includes("```")) {
            const jsonStart = jsonText.indexOf("```") + 3;
            const jsonEnd = jsonText.lastIndexOf("```");
            if (jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonText = jsonText.substring(jsonStart, jsonEnd).trim();
            }
        }

        // Try to find JSON object boundaries if the text contains extra content
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }

        // Clean control characters that are not properly escaped in JSON strings
        // JSON doesn't allow unescaped control characters in string literals
        // We need to escape them properly or remove them
        // Simple approach: remove all control characters and normalize whitespace
        jsonText = jsonText
            // Remove all control characters (0x00-0x1F except space, 0x7F)
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            // Replace newlines and tabs with spaces (they should be escaped in JSON strings)
            .replace(/[\n\r\t]/g, ' ')
            // Collapse multiple spaces
            .replace(/\s+/g, ' ')
            .trim();

        let generated;
        try {
            generated = JSON.parse(jsonText);
        } catch (parseError: any) {
            // If parsing fails, try to fix common issues
            console.error("[Mistral Store Agent] JSON parse error, attempting to fix:", parseError.message);
            console.error("[Mistral Store Agent] JSON text (first 500 chars):", jsonText.substring(0, 500));
            
            // Try to extract JSON object more carefully
            const jsonStart = jsonText.indexOf('{');
            const jsonEnd = jsonText.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
                
                // More aggressive cleaning: remove all control characters
                jsonText = jsonText
                    .replace(/[\x00-\x1F\x7F]/g, '') // Remove all control chars
                    .replace(/\s+/g, ' '); // Collapse multiple spaces
                
                try {
                    generated = JSON.parse(jsonText);
                } catch (secondError: any) {
                    console.error("[Mistral Store Agent] Second parse attempt failed:", secondError.message);
                    // Fall through to return fallback content
                    throw new Error(`Failed to parse JSON from Mistral response: ${secondError.message}`);
                }
            } else {
                throw new Error(`No valid JSON object found in response: ${parseError.message}`);
            }
        }

        // Validate and return generated content
        return {
            hero: {
                title: generated.hero?.title || `Welcome to ${brandName}`,
                subtitle: generated.hero?.subtitle || description.substring(0, 100),
                imageUrl: generated.hero?.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
            },
            about: {
                title: generated.about?.title || `About ${brandName}`,
                description: generated.about?.description || description,
            },
            footer: {
                text: generated.footer?.text || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`,
            },
        };
    } catch (error: any) {
        console.error("[Mistral Store Agent] Error generating content:", error);
        
        // Return fallback content on error
        return {
            hero: {
                title: `Welcome to ${brandName}`,
                subtitle: description.substring(0, 100) || "Your one-stop shop for quality products",
                imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
            },
            about: {
                title: `About ${brandName}`,
                description: description || "We are dedicated to providing the best products and services to our customers.",
            },
            footer: {
                text: `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`,
            },
        };
    }
}

/**
 * Legacy function for backward compatibility
 * This is used by the existing AI setup flow
 */
export async function generateStoreSetupResponse(
    ownerId: string,
    prompt: string,
    plan?: string,
    threadId?: string,
    selectedTheme?: any,
    selectedThemeStructure?: any,
    selectedProductPageStructure?: any
): Promise<any> {
    // For now, just return a placeholder response
    // The actual implementation would use the LangGraph agent
    // This is kept for backward compatibility
    return {
        storeData: null,
        uiAction: null,
        showPreviewEdit: false,
        message: "Store generation in progress",
    };
}
