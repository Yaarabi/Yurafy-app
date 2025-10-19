
import mongoose, { Schema, Document } from "mongoose";

export interface IAIAgent {
    owner: string; // User ID
    account: string; // WhatsAppAccount ID
    enabled: boolean; // connect/disconnect
    prompt: string; // base system prompt / personality
    tools: {
        orderConfirmation: boolean;
        sellerMessaging: boolean;
        audioAssets: {
            title: string;
            url: string;
            trigger: string; // e.g. "greeting", "order_shipped"
            active: boolean;
        }[];
    };
    memory?: string; // single string summary
    createdAt: Date;
    updatedAt: Date;
}

const AIAgentSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        account: { type: Schema.Types.ObjectId, ref: "WhatsAppAccount", default: null, required: false },
        enabled: { type: Boolean, default: false },
        prompt: { type: String, default: "You are a helpful sales assistant." },
        tools: {
        orderConfirmation: { type: Boolean, default: false },
        sellerMessaging: { type: Boolean, default: false },
        audioAssets: [
            {
            title: String,
            url: String,
            trigger: String,
            active: { type: Boolean, default: true },
            },
        ],
        },
        memory: { type: String, default: "" }, 

    },
    { timestamps: true }
);

export default mongoose.models.AIAgent || mongoose.model("AIAgent", AIAgentSchema);
