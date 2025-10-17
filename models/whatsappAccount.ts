import mongoose, { Schema, Document } from "mongoose";

export interface IWhatsAppAccount extends Document {
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
    preferredTemplates?: {
        greeting?: string;
        orderConfirmation?: string;
        fallback?: string;
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
        preferredTemplates: {
        greeting: { type: String, default: "greeting" }, // name of the Template
        orderConfirmation: { type: String, default: "order_confirmation" },
        fallback: { type: String, default: "fallback" },
        },
        aiConfig: {
        personality: { type: String, default: "friendly assistant" },
        knowledgeBaseId: { type: String },
        },
    },
    { timestamps: true }
);

export default
    mongoose.models.WhatsAppAccount || mongoose.model("WhatsAppAccount", WhatsAppAccountSchema);
