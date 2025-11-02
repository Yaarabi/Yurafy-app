import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";
import Store from "@/models/store";
import User from "@/models/users";
import { connectDB } from "../../db/mongoDB";

/**
 * Save store information tool
 * Allows the AI agent to save/store the store configuration directly to the database
 * Matches the exact Store schema structure from models/store.ts
 */
export const saveStoreTool = tool(
    async ({
        ownerId,
        brandName,
        domain,
        description,
        themeId,
        theme,
        themeStructure,
        hero,
        about,
        footer,
        socialLinks,
        headerLinks,
        logoUrl,
    }: {
        ownerId: string;
        brandName: string;
        domain?: string;
        description: string;
        themeId: number;
        theme: {
            primaryColor: string;
            secondaryColor?: string;
            textColor?: string;
        };
        themeStructure?: {
            header?: boolean;
            hero?: boolean;
            about?: boolean;
            trust?: boolean;
            productGrid?: boolean;
            footer?: boolean;
        };
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
        socialLinks?: {
            facebook?: string;
            instagram?: string;
            twitter?: string;
        };
        headerLinks?: Array<{
            label: string;
            href: string;
        }>;
        logoUrl?: string;
    }) => {
        try {
            await connectDB();

            // Generate domain from brand name if not provided, otherwise normalize
            let finalDomain = domain;
            if (!finalDomain || finalDomain.trim() === '') {
                finalDomain = brandName
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
            }
            const normalizedDomain = finalDomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

            // Validate ownerId is a valid MongoDB ObjectId format
            if (!ownerId || typeof ownerId !== 'string' || ownerId.trim() === '') {
                console.error('Save store tool: ownerId is missing or empty');
                return `❌ Error: Owner ID is missing. Please contact support.`;
            }

            if (!mongoose.Types.ObjectId.isValid(ownerId)) {
                console.error('Save store tool: Invalid ownerId format:', ownerId, 'Type:', typeof ownerId);
                return `❌ Error: Invalid owner ID format (${ownerId}). Please contact support.`;
            }

            const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

            // Get user's logo if logoUrl is not provided
            let finalLogoUrl = logoUrl;
            if (!finalLogoUrl) {
                try {
                    const user = await User.findById(ownerObjectId).select('logo').lean();
                    if (user?.logo) {
                        finalLogoUrl = user.logo;
                    }
                } catch (error) {
                    console.error('Error fetching user logo:', error);
                }
            }

            // Check if store already exists for this owner or domain
            const existingStore = await Store.findOne({
                $or: [
                    { owner: ownerObjectId },
                    { domain: normalizedDomain }
                ]
            });

            if (existingStore) {
                if (existingStore.owner.toString() === ownerId) {
                    return `❌ Store already exists for this owner. Please update the existing store instead of creating a new one.`;
                } else {
                    return `❌ Domain "${normalizedDomain}" is already taken. Please choose a different domain.`;
                }
            }

            // Validate required fields (domain will be auto-generated if not provided)
            if (!brandName || !description || !themeId || !theme?.primaryColor || 
                !hero?.title || !hero?.subtitle || !hero?.imageUrl ||
                !about?.title || !about?.description || !footer?.text) {
                return `❌ Missing required fields. Please provide: brandName, description, themeId, theme.primaryColor, hero (title, subtitle, imageUrl), about (title, description), and footer.text. Domain will be auto-generated from brandName if not provided.`;
            }

            // Create new store matching the exact schema
            const newStore = await Store.create({
                owner: ownerObjectId,
                brandName,
                domain: normalizedDomain,
                description,
                themeId,
                theme: {
                    primaryColor: theme.primaryColor,
                    secondaryColor: theme.secondaryColor,
                    textColor: theme.textColor,
                },
                themeStructure: {
                    header: themeStructure?.header ?? true,
                    hero: themeStructure?.hero ?? true,
                    about: themeStructure?.about ?? true,
                    trust: themeStructure?.trust ?? true,
                    productGrid: themeStructure?.productGrid ?? true,
                    footer: themeStructure?.footer ?? true,
                },
                hero: {
                    title: hero.title,
                    subtitle: hero.subtitle,
                    imageUrl: hero.imageUrl,
                },
                about: {
                    title: about.title,
                    description: about.description,
                },
                footer: {
                    text: footer.text,
                },
                socialLinks: socialLinks ? {
                    facebook: socialLinks.facebook,
                    instagram: socialLinks.instagram,
                    twitter: socialLinks.twitter,
                } : undefined,
                headerLinks: headerLinks || [],
                logoUrl: finalLogoUrl, // Include logoUrl if available
                active: true, // Set active when store is created
            });

            return `✅ Store "${brandName}" has been created successfully! Domain: ${newStore.domain}. Store ID: ${newStore._id}. The store is now ready to use!`;
        } catch (error) {
            console.error('Save store tool error:', error);
            console.error('Error details:', {
                ownerId,
                ownerIdType: typeof ownerId,
                brandName,
                domain,
                error: error instanceof Error ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                } : error
            });
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            // Provide more helpful error messages
            if (errorMessage.includes('ObjectId') || errorMessage.includes('BSON')) {
                return `❌ Error: Invalid owner ID format. Please contact support with this information: Owner ID type: ${typeof ownerId}, Value: ${ownerId?.substring(0, 10)}...`;
            }
            
            return `❌ Error saving store: ${errorMessage}. Please check that all required fields are provided correctly.`;
        }
    },
    {
        name: "save_store",
        description: `Save the store configuration to the database using the exact Store schema structure. Use this tool ONLY when:
1. You have collected ALL required information:
   - brandName (required)
   - domain (recommended but optional - unique URL-friendly slug like "my-awesome-store" - if not provided, will be auto-generated from brandName by converting to lowercase and replacing spaces with hyphens)
   - description (required)
   - themeId (required, number 1-11 for theme selection)
   - theme with primaryColor (required), secondaryColor, textColor
   - hero with title, subtitle, imageUrl (all required)
   - about with title, description (both required)
   - footer with text (required)
2. The user explicitly confirms they want to create the store (e.g., "yes", "create it", "let's do it", "save it")
3. You have asked "Would you like me to create your store with these details?" and they confirmed

IMPORTANT: 
- Always present the domain to the user in the confirmation summary, whether you collected it from them or auto-generated it from the brand name. The domain will be used in the store URL (e.g., yoursite.com/[domain]). The domain will be automatically normalized (lowercase, hyphenated, no special chars) when saved.
- For ownerId: Use the User ID from the User Information section above. This is the ID of the authenticated user creating the store.`,
        schema: z.object({
            ownerId: z.string().describe("The ID of the store owner (use the User ID from User Information - this is provided in the context above)"),
            brandName: z.string().describe("The brand/store name (required)"),
            domain: z.string().optional().describe("The unique domain/slug for the store that will be used in the store URL (e.g., 'my-awesome-store' for 'mysite.com/my-awesome-store'). Will be normalized to lowercase, hyphenated, no special chars. If not provided, will be auto-generated from brandName by converting spaces to hyphens and lowercasing. RECOMMENDED: Ask the user for their preferred domain or suggest one based on their brand name."),
            description: z.string().describe("Store description (required)"),
            themeId: z.number().describe("Theme ID number (1-11, required)"),
            theme: z.object({
                primaryColor: z.string().describe("Primary theme color in hex format (e.g., #3B82F6, required)"),
                secondaryColor: z.string().optional().describe("Secondary theme color in hex format"),
                textColor: z.string().optional().describe("Text color in hex format"),
            }).describe("Store theme colors"),
            themeStructure: z.object({
                header: z.boolean().optional().describe("Show header section (default: true)"),
                hero: z.boolean().optional().describe("Show hero section (default: true)"),
                about: z.boolean().optional().describe("Show about section (default: true)"),
                trust: z.boolean().optional().describe("Show trust section (default: true)"),
                productGrid: z.boolean().optional().describe("Show product grid (default: true)"),
                footer: z.boolean().optional().describe("Show footer section (default: true)"),
            }).optional().describe("Theme structure visibility settings"),
            hero: z.object({
                title: z.string().describe("Hero section main title (required)"),
                subtitle: z.string().describe("Hero section subtitle (required)"),
                imageUrl: z.string().describe("Hero section image URL (required)"),
            }).describe("Hero section content"),
            about: z.object({
                title: z.string().describe("About section title (required)"),
                description: z.string().describe("About section description (required)"),
            }).describe("About section content"),
            footer: z.object({
                text: z.string().describe("Footer text content (required)"),
            }).describe("Footer content"),
            socialLinks: z.object({
                facebook: z.string().optional().describe("Facebook page URL"),
                instagram: z.string().optional().describe("Instagram profile URL"),
                twitter: z.string().optional().describe("Twitter profile URL"),
            }).optional().describe("Social media links"),
            headerLinks: z.array(z.object({
                label: z.string().describe("Link label/text"),
                href: z.string().describe("Link URL/path"),
            })).optional().describe("Header navigation links array"),
            logoUrl: z.string().optional().describe("Store logo URL (optional, will use user's logo if not provided)"),
        }),
    }
);
