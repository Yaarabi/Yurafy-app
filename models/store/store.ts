import mongoose, { Schema, Document } from "mongoose";

export interface IStore extends Document {
    owner: mongoose.Types.ObjectId;
    brandName: string;
    domain: string;
    description: string;
    language?: string; // Store language: 'en', 'fr', or 'ar'
    themeId: number;
    theme: {
        primaryColor: string;
        secondaryColor?: string;
        textColor?: string;
        surfaceColor?: string;
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
    socialLinks: {
        facebook?: string;
        instagram?: string;
        tiktok?: string;
    };
    whatsappNumber?: string;
    headerLinks: Array<{
        label: string;
        href: string;
    }>;
    logoUrl?: string;
    active?: boolean;
    categories?: Array<{
        name: string;
        img: string;
    }>;
    specialOffer?: {
        productId: mongoose.Types.ObjectId;
        offerTimeEnd: Date;
        discount: number;
        description: string;
        paused?: boolean;
    };
}

const storeSchema = new Schema<IStore>(
    {
        owner: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true,
            index: true, // Index for owner lookups
        },
        brandName: { 
            type: String, 
            required: true, 
            trim: true,
            index: true, // Index for search
        },
        domain: { 
            type: String, 
            required: true, 
            trim: true, 
            unique: true, 
            lowercase: true,
            index: true, // Unique index already exists
        },
        description: { type: String, required: true, trim: true },
        language: { 
            type: String, 
            enum: ['en', 'fr', 'ar'],
            default: 'en',
            index: true, // Index for language filtering
        },
        themeId: { 
            type: Number, 
            required: true,
            index: true, // Index for theme filtering
        },

        theme: {
            primaryColor: { type: String, required: true, trim: true },
            secondaryColor: { type: String, trim: true },
            textColor: { type: String, trim: true },
            surfaceColor: { type: String, trim: true },
        },

        themeStructure: {
            header: { type: Boolean, default: true },
            hero: { type: Boolean, default: true },
            about: { type: Boolean, default: true },
            trust: { type: Boolean, default: true },
            productGrid: { type: Boolean, default: true },
            footer: { type: Boolean, default: true },
        },

        hero: {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        imageUrl: { type: String, required: true, trim: true },
        },

        about: {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        },

        footer: {
        text: { type: String, required: true, trim: true },
        },

        socialLinks: {
        facebook: { type: String, trim: true, default: 'www.facebook.com' },
        instagram: { type: String, trim: true, default: 'www.instagram.com' },
        tiktok: { type: String, trim: true, default: 'www.tiktok.com' },
        },
        whatsappNumber: { type: String, trim: true },
        headerLinks: [
        {
            label: { type: String, required: true, trim: true },
            href: { type: String, required: true, trim: true },
        },
        ],
        logoUrl: { 
            type: String, 
            trim: true,
        },
        active: { 
            type: Boolean, 
            default: false,
            index: true, // Index for filtering active stores
        },
        categories: [
            {
                name: { type: String, required: true, trim: true },
                img: { type: String, required: true, trim: true },
            }
        ],
        specialOffer: {
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Product",
            },
            offerTimeEnd: { type: Date },
            discount: { type: Number, min: 0, max: 100 },
            description: { type: String, trim: true },
            paused: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

// Compound indexes for common queries
storeSchema.index({ owner: 1, domain: 1 });

export default mongoose.models.Store || mongoose.model<IStore>("Store", storeSchema);
