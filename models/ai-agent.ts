
import mongoose, { Schema, Document } from "mongoose";

export interface IAIAgent extends Document {
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
    memory: {
        short: {
            customer: string; // phone number
            messages: { role: "user" | "agent"; text: string; ts: number }[];
            state?: string;
        }[];
        long: {
            customer: string;
            profile: { name?: string; preferences?: string[]; lastOrderId?: string };
            notes?: { text: string; ts: number }[];
        }[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const AIAgentSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        account: { type: Schema.Types.ObjectId, ref: "WhatsAppAccount", required: true },
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
        memory: {
        short: [
            {
            customer: String,
            messages: [
                {
                role: { type: String, enum: ["user", "agent"] },
                text: String,
                ts: Number,
                },
            ],
            state: String,
            },
        ],
        long: [
            {
            customer: String,
            profile: {
                name: String,
                preferences: [String],
                lastOrderId: String,
            },
            notes: [{ text: String, ts: Number }],
            },
        ],
        },
    },
    { timestamps: true }
);

export default mongoose.models.AIAgent || mongoose.model("AIAgent", AIAgentSchema);
