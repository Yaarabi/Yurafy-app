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
    themeStructure: {
        header: boolean;
        hero: boolean;
        about: boolean;
        trust: boolean;
        productGrid: boolean;
        footer: boolean;
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
        twitter?: string;
    };
    headerLinks: Array<{
        label: string;
        href: string;
    }>;
}

const storeSchema = new Schema<IStore>(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        brandName: { type: String, required: true, trim: true },
        domain: { type: String, required: true, trim: true, unique: true, lowercase: true },
        description: { type: String, required: true, trim: true },
        themeId: { type: Number, required: true },

        theme: {
        primaryColor: { type: String, required: true, trim: true },
        secondaryColor: { type: String, trim: true },
        textColor: { type: String, trim: true },
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
        facebook: { type: String, trim: true },
        instagram: { type: String, trim: true },
        twitter: { type: String, trim: true },
        },

        headerLinks: [
        {
            label: { type: String, required: true, trim: true },
            href: { type: String, required: true, trim: true },
        },
        ],
    },
    { timestamps: true }
);

export default mongoose.models.Store || mongoose.model<IStore>("Store", storeSchema);
