import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";
import Store from "@/models/store";
import { connectDB } from "../../db/mongoDB";

/**
 * Save store information tool
 * Allows the AI agent to save/store the store configuration directly to the database
 */
export const saveStoreTool = tool(
    async ({
        ownerId,
        brandName,
        domain,
        description,
        logoUrl,
        faviconUrl,
        whoWeAre,
        socialLinks,
        theme,
        hero,
        customization,
        seo,
        businessInfo,
        paymentMethods,
        codEnabled,
        shippingInfo,
    }: {
        ownerId: string;
        brandName: string;
        domain: string;
        description?: string;
        logoUrl?: string;
        faviconUrl?: string;
        whoWeAre?: { description?: string; imageUrl?: string };
        socialLinks?: {
            facebook?: string;
            instagram?: string;
            twitter?: string;
            linkedin?: string;
            youtube?: string;
            tiktok?: string;
            whatsapp?: string;
        };
        theme?: {
            primaryColor?: string;
            secondaryColor?: string;
            textColor?: string;
            gradient?: { from?: string; via?: string; to?: string };
        };
        hero?: {
            title?: string;
            subtitle?: string;
            imageUrl?: string;
            ctaText?: string;
            ctaLink?: string;
        };
        customization?: {
            layout?: 'grid' | 'list' | 'masonry';
            showCategories?: boolean;
            showFilters?: boolean;
            productsPerPage?: number;
            enableSearch?: boolean;
            enableReviews?: boolean;
            enableWishlist?: boolean;
            enableCompare?: boolean;
            footerText?: string;
            customCSS?: string;
            customJS?: string;
        };
        seo?: {
            metaTitle?: string;
            metaDescription?: string;
            keywords?: string[];
            ogImage?: string;
        };
        businessInfo?: {
            address?: string;
            city?: string;
            country?: string;
            phone?: string;
            email?: string;
            workingHours?: string;
            taxId?: string;
        };
        paymentMethods?: string[];
        codEnabled?: boolean;
        shippingInfo?: {
            freeShippingThreshold?: number;
            shippingZones?: Array<{
                name: string;
                countries: string[];
                price: number;
            }>;
        };
    }) => {
        try {
            await connectDB();

            // Normalize domain
            const normalizedDomain = domain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

            // Check if store already exists
            const existingStore = await Store.findOne({
                $or: [
                    { owner: new mongoose.Types.ObjectId(ownerId) },
                    { domain: normalizedDomain }
                ]
            });

            if (existingStore) {
                return `❌ Store already exists. A store with domain "${normalizedDomain}" or for this owner already exists. Please use a different domain.`;
            }

            // Create new store
            const newStore = await Store.create({
                owner: new mongoose.Types.ObjectId(ownerId),
                brandName,
                domain: normalizedDomain,
                description,
                logoUrl,
                faviconUrl,
                whoWeAre,
                socialLinks,
                theme,
                hero,
                customization,
                seo,
                businessInfo,
                paymentMethods,
                codEnabled,
                shippingInfo,
            });

            return `✅ Store "${brandName}" has been created successfully! Domain: ${newStore.domain}. Store ID: ${newStore._id}. The store is now ready to use!`;
        } catch (error) {
            console.error('Save store tool error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return `❌ Error saving store: ${errorMessage}. Please check that all required fields are provided and the domain is unique.`;
        }
    },
    {
        name: "save_store",
        description: `Save the store configuration to the database. Use this tool ONLY when:
1. You have collected sufficient information (at minimum: brandName and domain)
2. The user explicitly confirms they want to create the store (e.g., "yes", "create it", "let's do it", "save it")
3. You have asked "Would you like me to create your store with these details?" and they confirmed

This will create the store in the database using the store model. Make sure the domain is unique and SEO-friendly (lowercase, hyphenated).`,
        schema: z.object({
            ownerId: z.string().describe("The ID of the store owner"),
            brandName: z.string().describe("The brand/store name"),
            domain: z.string().describe("The unique domain/slug for the store (will be normalized to lowercase, hyphenated, no special chars)"),
            description: z.string().optional().describe("Store description"),
            logoUrl: z.string().optional().describe("Logo image URL"),
            faviconUrl: z.string().optional().describe("Favicon image URL"),
            whoWeAre: z.object({
                description: z.string().optional(),
                imageUrl: z.string().optional(),
            }).optional().describe("About us information"),
            socialLinks: z.object({
                facebook: z.string().optional(),
                instagram: z.string().optional(),
                twitter: z.string().optional(),
                linkedin: z.string().optional(),
                youtube: z.string().optional(),
                tiktok: z.string().optional(),
                whatsapp: z.string().optional(),
            }).optional().describe("Social media links"),
            theme: z.object({
                primaryColor: z.string().optional(),
                secondaryColor: z.string().optional(),
                textColor: z.string().optional(),
                gradient: z.object({
                    from: z.string().optional(),
                    via: z.string().optional(),
                    to: z.string().optional(),
                }).optional(),
            }).optional().describe("Store theme colors"),
            hero: z.object({
                title: z.string().optional(),
                subtitle: z.string().optional(),
                imageUrl: z.string().optional(),
                ctaText: z.string().optional(),
                ctaLink: z.string().optional(),
            }).optional().describe("Hero section content"),
            customization: z.object({
                layout: z.enum(['grid', 'list', 'masonry']).optional(),
                showCategories: z.boolean().optional(),
                showFilters: z.boolean().optional(),
                productsPerPage: z.number().optional(),
                enableSearch: z.boolean().optional(),
                enableReviews: z.boolean().optional(),
                enableWishlist: z.boolean().optional(),
                enableCompare: z.boolean().optional(),
                footerText: z.string().optional(),
                customCSS: z.string().optional(),
                customJS: z.string().optional(),
            }).optional().describe("Store customization options"),
            seo: z.object({
                metaTitle: z.string().optional(),
                metaDescription: z.string().optional(),
                keywords: z.array(z.string()).optional(),
                ogImage: z.string().optional(),
            }).optional().describe("SEO settings"),
            businessInfo: z.object({
                address: z.string().optional(),
                city: z.string().optional(),
                country: z.string().optional(),
                phone: z.string().optional(),
                email: z.string().optional(),
                workingHours: z.string().optional(),
                taxId: z.string().optional(),
            }).optional().describe("Business information"),
            paymentMethods: z.array(z.string()).optional().describe("Accepted payment methods"),
            codEnabled: z.boolean().optional().describe("Enable Cash on Delivery option"),
            shippingInfo: z.object({
                freeShippingThreshold: z.number().optional(),
                shippingZones: z.array(z.object({
                    name: z.string(),
                    countries: z.array(z.string()),
                    price: z.number(),
                })).optional(),
            }).optional().describe("Shipping information"),
        }),
    }
);
