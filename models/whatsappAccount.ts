import mongoose, { Schema } from "mongoose";

export interface IWhatsAppAccount{
    _id: string;
    owner: string;
    waBusinessId: string;
    waNumberId: string;
    waNumber: string;
    waTokenEncrypted: string;
    webhookVerifyToken?: string; // Per-user verify token for GET webhook
    webhookSecretEncrypted?: string; // Encrypted webhook secret for POST signature verification
    verified: boolean;
    status: "connected" | "disconnected";
    settings: {
        autoReply: boolean;
        ad:boolean;
        aiAgent: boolean;
    };
    preferredTemplates?: {
        greeting?: string;
        ad?: string;
    };
    detectionRules?: [
    {
        keywords?: string[];
        template?: string;  
        active?: Boolean;
    },
    ];
    aiConfig?: {
        personality: string;
        knowledgeBaseId?: string;
    };
    active?: boolean;
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
        webhookVerifyToken: { type: String }, // Per-user verify token for GET webhook
        webhookSecretEncrypted: { type: String }, // Encrypted webhook secret for POST signature verification
        verified: { type: Boolean, default: false },
        status: {
        type: String,
        enum: ["disconnected", "connected"],
        default: "disconnected",
        },
        settings: {
        autoReply: { type: Boolean, default: false },
        ad: { type: Boolean, default: false },
        aiAgent: { type: Boolean, default: false },
        },
        preferredTemplates: {
        greeting: { type: String, default: null },
        ad: { type: String, default: null },
        },
        detectionRules: [
            {
                keywords: [{ type: String }], // e.g. ["facebook", "promo", "insta"]                                                                            
                template: { type: String },   // name of template to send       
                active: { type: Boolean, default: false },
            },
        ],
        aiConfig: {
        personality: { type: String, default: "friendly assistant" },
        knowledgeBaseId: { type: String },
        },
        active: {
            type: Boolean,
            default: false,
            index: true, // Index for filtering active accounts
        },
    },
    { timestamps: true }
);

export default
    mongoose.models.WhatsAppAccount || mongoose.model("WhatsAppAccount", WhatsAppAccountSchema);
