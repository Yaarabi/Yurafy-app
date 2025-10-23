
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
    whoWeAre?: string;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
    };
    theme?: Theme;
    hero?: { title?: string; subtitle?: string; imageUrl?: string };
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
        whoWeAre: { type: String, trim: true },
        socialLinks: {
            facebook: { type: String, trim: true },
            instagram: { type: String, trim: true },
            twitter: { type: String, trim: true },
            linkedin: { type: String, trim: true },
        },
        theme: {
            primaryColor: { type: String, trim: true, default: defaultTheme.primaryColor },
            secondaryColor: { type: String, trim: true, default: defaultTheme.secondaryColor },
            textColor: { type: String, trim: true, default: defaultTheme.textColor },
            gradient: {
                from: { type: String, trim: true, default: defaultTheme.gradient?.from },
                via: { type: String, trim: true, default: defaultTheme.gradient?.via },
                to: { type: String, trim: true, default: defaultTheme.gradient?.to },
        }},
        hero: {
            title: { type: String, trim: true },
            subtitle: { type: String, trim: true },
            imageUrl: { type: String, trim: true },
        },
    },
    { timestamps: true }
);

export default mongoose.models.Store || mongoose.model("Store", storeSchema);

