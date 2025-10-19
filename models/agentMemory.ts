import mongoose, { Schema, Document } from "mongoose";

export interface IAgentMemory extends Document {
    owner: string;
    customerPhone: string;
    customerName?: string;
    summary: string;
    createdAt: Date;
    updatedAt: Date;
}

const AgentMemorySchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        customerPhone: { type: String, required: true },
        customerName: { type: String },
        summary: { type: String, required: true },
    },
    { timestamps: true }
);

// ensure one memory per customer per owner
AgentMemorySchema.index({ owner: 1, customerPhone: 1 }, { unique: true });

export default mongoose.models.AgentMemory || mongoose.model("AgentMemory", AgentMemorySchema);
