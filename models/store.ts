
import mongoose, { Schema, Document } from "mongoose";

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
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        buttonColor?: string;
        headerColor?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const storeSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        brandName: { type: String, required: true },
        domain: { type: String, required: true, unique: true },
        description: { type: String },
        logoUrl: { type: String },
        coverImageUrl: { type: String },
        whoWeAre: { type: String }, // Who We Are section
        socialLinks: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        },
        theme: {
            primaryColor: { type: String },
            secondaryColor: { type: String },
            backgroundColor: { type: String },
            textColor: { type: String },
            buttonColor: { type: String },
            headerColor: { type: String }
        }

    },
    { timestamps: true }
);

export default mongoose.models.Store || mongoose.model("Store", storeSchema);
