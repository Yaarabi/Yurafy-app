import mongoose, { Schema, Document } from "mongoose";


export interface IAIAgent extends Document {
    owner: string; // User ID
    account: string; // WhatsAppAccount ID
    enabled: boolean; // connect/disconnect
    prompt: string; // base system prompt / personality
    templates: string[]; // list of template names (e.g. "order_bot", "faq_bot")
    memory?: string; // single string summary
    file?:string;
    active?: boolean;
    enabledTools?: Record<string, boolean>; // Tool enable/disable settings (toolName -> enabled)
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose schema for AIAgent
 */
const AIAgentSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        account: { type: Schema.Types.ObjectId, ref: "WhatsAppAccount", default: null },
        enabled: { type: Boolean, default: false },
        prompt: { type: String, default: "You are a helpful sales assistant." },
        templates: [{ type: [String], default: [] }],
        memory: { type: String, default: "" },
        file: { type: String, default: "" },
        active: { 
            type: Boolean, 
            default: false,
            index: true, // Index for filtering active agents
        },
        enabledTools: {
            type: Map,
            of: Boolean,
            default: {},
        },
    },
    { timestamps: true }
);

/**
 * Export the model
 */
export default mongoose.models.AIAgent || mongoose.model<IAIAgent>("AIAgent", AIAgentSchema);
