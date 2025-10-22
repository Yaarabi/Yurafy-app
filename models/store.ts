
import mongoose, { Schema, Document } from "mongoose";
import { storeThemes } from "@/public/themes";

type ButtonStyle = "solid" | "outline" | "ghost";

export type Theme = {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    headerColor?: string;
    footerColor?: string;
    borderColor?: string;
    gradient?: { from?: string; via?: string; to?: string };
    borderRadius?: string;
    shadow?: boolean;
    fontFamily?: string;
    headingWeight?: string;
    buttonStyle?: ButtonStyle;
};

// sanitize theme to ensure buttonStyle is correct
export function sanitizeTheme(theme: any): Theme {
    const validStyles: ButtonStyle[] = ["solid", "outline", "ghost"];
    return {
        ...theme,
        buttonStyle: validStyles.includes(theme?.buttonStyle) ? theme.buttonStyle : "solid",
    };
}

// pick default theme safely
export const defaultTheme: Theme = sanitizeTheme(storeThemes.find((t) => t.name === "Classic Green")?.theme);



export interface IStore extends Document {
    _id: string;
    owner: mongoose.Types.ObjectId;
    brandName: string;
    domain: string;
    description?: string;
    logoUrl?: string;
    coverImageUrl?: string;
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
        coverImageUrl: { type: String, trim: true },
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
            backgroundColor: { type: String, trim: true, default: defaultTheme.backgroundColor },
            textColor: { type: String, trim: true, default: defaultTheme.textColor },
            buttonColor: { type: String, trim: true, default: defaultTheme.buttonColor },
            headerColor: { type: String, trim: true, default: defaultTheme.headerColor },
            footerColor: { type: String, trim: true, default: defaultTheme.footerColor || "#111827" },
            borderColor: { type: String, trim: true, default: defaultTheme.borderColor || "#111827" }, // 🆕 Added
            gradient: {
                from: { type: String, trim: true, default: defaultTheme.gradient?.from },
                via: { type: String, trim: true, default: defaultTheme.gradient?.via },
                to: { type: String, trim: true, default: defaultTheme.gradient?.to },
            },
            borderRadius: { type: String, trim: true, default: defaultTheme.borderRadius },
            shadow: { type: Boolean, default: defaultTheme.shadow },
            fontFamily: { type: String, trim: true, default: defaultTheme.fontFamily },
            headingWeight: { type: String, trim: true, default: defaultTheme.headingWeight },
            buttonStyle: { type: String, enum: ["solid", "outline", "ghost"], default: defaultTheme.buttonStyle },
        },
        hero: {
            title: { type: String, trim: true },
            subtitle: { type: String, trim: true },
            imageUrl: { type: String, trim: true },
        },
    },
    { timestamps: true }
);

export default mongoose.models.Store || mongoose.model("Store", storeSchema);

