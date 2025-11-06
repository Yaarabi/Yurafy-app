import mongoose, { Schema, Document } from "mongoose";

export interface IStore extends Document {
    _id: string;
    owner: mongoose.Types.ObjectId;
    brandName: string;
    domain: string;
    description: string;
    themeId: number;
    theme: {
        primaryColor: string;
        secondaryColor?: string;
        textColor?: string;
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
    headerLinks: Array<{
        label: string;
        href: string;
    }>;
    active?: boolean;
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
        themeId: { 
            type: Number, 
            required: true,
            index: true, // Index for theme filtering
        },

        theme: {
        primaryColor: { type: String, required: true, trim: true },
        secondaryColor: { type: String, trim: true },
        textColor: { type: String, trim: true },
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

        headerLinks: [
        {
            label: { type: String, required: true, trim: true },
            href: { type: String, required: true, trim: true },
        },
        ],
        active: { 
            type: Boolean, 
            default: false,
            index: true, // Index for filtering active stores
        },
    },
    { timestamps: true }
);

// Compound indexes for common queries
storeSchema.index({ owner: 1, domain: 1 });

export default mongoose.models.Store || mongoose.model<IStore>("Store", storeSchema);
