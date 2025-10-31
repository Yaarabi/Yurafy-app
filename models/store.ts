
import mongoose, { Schema, Document } from "mongoose";
import { storeThemes } from "@/public/themes";



export type Theme = {
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    gradient?: { from?: string; via?: string; to?: string };
};




export const defaultTheme: Theme = storeThemes.find((t) => t.name === "Classic Green")?.theme ?? {
    primaryColor: "#00A86B",
    secondaryColor: "#006644",
    textColor: "#FFFFFF",
    gradient: {
        from: "#00A86B",
        via: "#00C781",
        to: "#00FF99",
    },
};


export interface IStore extends Document {
    _id: string;
    owner: mongoose.Types.ObjectId;
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
    theme?: Theme;
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
    createdAt: Date;
    updatedAt: Date;
}

const storeSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        brandName: { type: String, required: true, trim: true },
        domain: { type: String, required: true, unique: true, trim: true },
        description: { type: String, trim: true },
        logoUrl: { type: String, trim: true },
        whoWeAre: {
            description: { type: String, trim: true },
            imageUrl: { type: String, trim: true },
        },
        theme: {
            primaryColor: { type: String, trim: true, default: defaultTheme.primaryColor },
            secondaryColor: { type: String, trim: true, default: defaultTheme.secondaryColor },
            textColor: { type: String, trim: true, default: defaultTheme.textColor },
            gradient: {
                from: { type: String, trim: true, default: defaultTheme.gradient?.from },
                via: { type: String, trim: true, default: defaultTheme.gradient?.via },
                to: { type: String, trim: true, default: defaultTheme.gradient?.to },
            },
        },
        hero: {
            title: { type: String, trim: true },
            subtitle: { type: String, trim: true },
            imageUrl: { type: String, trim: true },
            ctaText: { type: String, trim: true },
            ctaLink: { type: String, trim: true },
        },
        faviconUrl: { type: String, trim: true },
        customization: {
            layout: { type: String, enum: ['grid', 'list', 'masonry'], default: 'grid' },
            showCategories: { type: Boolean, default: true },
            showFilters: { type: Boolean, default: true },
            productsPerPage: { type: Number, default: 12 },
            enableSearch: { type: Boolean, default: true },
            enableReviews: { type: Boolean, default: false },
            enableWishlist: { type: Boolean, default: false },
            enableCompare: { type: Boolean, default: false },
            footerText: { type: String, trim: true },
            customCSS: { type: String },
            customJS: { type: String },
        },
        seo: {
            metaTitle: { type: String, trim: true },
            metaDescription: { type: String, trim: true },
            keywords: [{ type: String, trim: true }],
            ogImage: { type: String, trim: true },
        },
        businessInfo: {
            address: { type: String, trim: true },
            city: { type: String, trim: true },
            country: { type: String, trim: true },
            phone: { type: String, trim: true },
            email: { type: String, trim: true },
            workingHours: { type: String, trim: true },
            taxId: { type: String, trim: true },
        },
        paymentMethods: [{ type: String, trim: true }],
        codEnabled: { type: Boolean, default: false },
        shippingInfo: {
            freeShippingThreshold: { type: Number },
            shippingZones: [{
                name: { type: String, trim: true },
                countries: [{ type: String, trim: true }],
                price: { type: Number },
            }],
        },
        socialLinks: {
            facebook: { type: String, trim: true },
            instagram: { type: String, trim: true },
            twitter: { type: String, trim: true },
            linkedin: { type: String, trim: true },
            youtube: { type: String, trim: true },
            tiktok: { type: String, trim: true },
            whatsapp: { type: String, trim: true },
        },
    },
    { timestamps: true }
);

export default mongoose.models.Store || mongoose.model("Store", storeSchema);

