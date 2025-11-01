import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import { generateStoreSetupResponse } from "@/lib/agent/storeAgent/storeAgent";
import { saveStoreTool } from "@/lib/agent/storeAgent/tools";

/**
 * POST /api/onboarding/generate-store
 * - Auto-generate store based on basic info (brandName, domain, description)
 * - Uses AI agent to generate complete store details without user interaction
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { 
            brandName, 
            domain, 
            description,
            plan,
            selectedTheme,
            selectedThemeStructure,
            selectedProductPageStructure
        } = await request.json();

        if (!brandName || !domain || !description) {
            return NextResponse.json({ 
                error: "Brand name, domain, and description are required" 
            }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Create a comprehensive prompt for the agent to generate the store
        const generationPrompt = `Generate a complete store setup immediately. Use the show_component tool with componentId="store_preview_edit" and pass ALL the generated data.

Given Information:
- Brand Name: ${brandName}
- Domain: ${domain}
- Description: ${description}
${selectedTheme ? `- Selected Theme: #${selectedTheme.themeId} with primary color ${selectedTheme.theme.primaryColor}${selectedTheme.theme.secondaryColor ? `, secondary color ${selectedTheme.theme.secondaryColor}` : ''}${selectedTheme.theme.textColor ? `, text color ${selectedTheme.theme.textColor}` : ''}` : ''}
${selectedThemeStructure ? `- Store Structure: header=${selectedThemeStructure.header}, hero=${selectedThemeStructure.hero}, about=${selectedThemeStructure.about}, trust=${selectedThemeStructure.trust}, productGrid=${selectedThemeStructure.productGrid}, footer=${selectedThemeStructure.footer}` : ''}

REQUIRED: Generate all of the following NOW and IMPROVE them based on the description "${description}":
1. Hero section (IMPROVE the descriptions):
   - Title: Create a compelling, professional headline for ${brandName} based on "${description}" (5-10 words, engaging and brand-focused)
   - Subtitle: Create an improved catchy tagline or value proposition based on "${description}" (10-20 words, persuasive and clear)
   - Image URL: A relevant Unsplash image URL based on the business type from description "${description}" (use specific, high-quality Unsplash URLs like https://images.unsplash.com/photo-...)

2. About section (IMPROVE and expand the description):
   - Title: "About ${brandName}" or similar professional title
   - Description: IMPROVE and EXPAND on "${description}" - make it 80-150 words, engaging, professional, and compelling. Add details about:
     * What makes ${brandName} unique
     * The brand's values or mission
     * What customers can expect
     * Make it more descriptive and appealing than the original description

3. Footer:
   - Text: Copyright notice or brand message for ${brandName}

4. Header links: Generate 3-5 relevant navigation links (e.g., Home: "/", Products: "/products", About: "/about", Contact: "/contact", Shop: "/shop")

5. Social media links (GENERATE ACTUAL LINKS, not placeholders):
   - Based on the business type from "${description}", generate realistic social media profile URLs:
     * Facebook: https://www.facebook.com/[brand-name] (format: lowercase, hyphens, no spaces)
     * Instagram: https://www.instagram.com/[brand-name] (format: lowercase, no spaces, hyphens only)
     * Twitter/X: https://twitter.com/[brand-name] or https://x.com/[brand-name] (format: lowercase, no spaces, hyphens only)
   - IMPORTANT: Generate actual working URLs based on the brand name "${brandName}". Format the brand name for URLs (lowercase, replace spaces with hyphens, remove special characters)
   - If the business type doesn't typically use certain social platforms, you can omit them, but generate at least 1-2 social links

CRITICAL: Call show_component tool IMMEDIATELY with componentId="store_preview_edit" and include ALL this data:
- brandName: "${brandName}"
- domain: "${domain}"
- description: "${description}"
- themeId: ${selectedTheme?.themeId || 1}
- theme: ${JSON.stringify(selectedTheme?.theme || { primaryColor: '#3B82F6' })}
- themeStructure: ${JSON.stringify(selectedThemeStructure || { header: true, hero: true, about: true, trust: true, productGrid: true, footer: true })}
- hero: {title (IMPROVED), subtitle (IMPROVED), imageUrl}
- about: {title, description (IMPROVED and EXPANDED - 80-150 words)}
- footer: {text}
- headerLinks: array of {label, href} (3-5 links)
- socialLinks: {facebook, instagram, twitter} (GENERATE ACTUAL URLs, not placeholders)

Do NOT ask questions. Just generate IMPROVED descriptions and show the preview NOW.`;

        // Call the agent to generate the store
        const result = await generateStoreSetupResponse(
            session.user.id,
            generationPrompt,
            plan,
            `store-generation-${session.user.id}-${Date.now()}`,
            selectedTheme,
            selectedThemeStructure,
            selectedProductPageStructure
        );

        // Extract store data from the agent response
        let storeData = result.storeData;
        
        // If agent didn't return complete store data in the expected format, 
        // extract it from the message or construct it
        if (!storeData || !storeData.brandName) {
            // Try to construct from the agent's response
            storeData = {
                brandName,
                domain,
                description,
                themeId: selectedTheme?.themeId || 1,
                theme: selectedTheme?.theme || { primaryColor: '#3B82F6' },
                themeStructure: selectedThemeStructure || {
                    header: true,
                    hero: true,
                    about: true,
                    trust: true,
                    productGrid: true,
                    footer: true,
                },
                hero: storeData?.hero || {
                    title: `Welcome to ${brandName}`,
                    subtitle: description.substring(0, 100),
                    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
                },
                about: storeData?.about || {
                    title: `About ${brandName}`,
                    description: description,
                },
                footer: storeData?.footer || {
                    text: `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`,
                },
                socialLinks: storeData?.socialLinks || {},
                headerLinks: storeData?.headerLinks || [],
            };
        } else {
            // Ensure the basic info is correct
            storeData.brandName = brandName;
            storeData.domain = domain;
            storeData.description = description;
        }

        return NextResponse.json({
            success: true,
            storeData,
            uiAction: result.uiAction,
            showPreviewEdit: result.showPreviewEdit || true,
            message: result.message,
        });

    } catch (error) {
        console.error("Error generating store:", error);
        return NextResponse.json(
            { error: "Failed to generate store" },
            { status: 500 }
        );
    }
}

