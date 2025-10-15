import mongoose, { Schema } from "mongoose";

export interface IWhatsAppAccount {
    owner: string;
    waBusinessId: string;
    waNumberId: string;
    waNumber: string;
    waTokenEncrypted: string;
    verified: boolean;
    status: "connected" | "disconnected";
    settings: {
        autoReply: boolean;
        orderConfirmation: boolean;
        aiAgent: boolean;
    };
    templates: {
        greeting: string;
        orderConfirmation: string;
        fallback: string;
    };
    aiConfig?: {
        personality: string;
        knowledgeBaseId?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const WhatsAppAccountSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        waBusinessId: { type: String, required: true },
        waNumberId: { type: String, required: true },
        waNumber: { type: String, required: true },
        waTokenEncrypted: { type: String, required: true },
        verified: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["disconnected", "connected"],
            default: "disconnected",
        },
        settings: {
            autoReply: { type: Boolean, default: false },
            orderConfirmation: { type: Boolean, default: false },
            aiAgent: { type: Boolean, default: false },
        },
        templates: {
            greeting: { type: String, default: "Hi 👋 How can we help you today?" },
            orderConfirmation: {
                type: String,
                default: "Your order has been confirmed ✅",
            },
            fallback: { type: String, default: "Our team will reply soon." },
        },
        aiConfig: {
            personality: { type: String, default: "friendly assistant" },
            knowledgeBaseId: { type: String },
        },
    },
    { timestamps: true }
);

export default mongoose.models.WhatsAppAccount || mongoose.model("WhatsAppAccount", WhatsAppAccountSchema);
