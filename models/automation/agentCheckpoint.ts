import mongoose, { Schema } from "mongoose";

export interface IAgentCheckpoint extends Document {
    threadId: string;
    checkpoint: string; // JSON string
    owner: string;
    customerPhone?: string;
    lastAccessed: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AgentCheckpointSchema = new Schema(
    {
        threadId: { type: String, required: true, unique: true, index: true },
        checkpoint: { type: String, required: true }, // JSON stringified checkpoint
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        customerPhone: { type: String, index: true },
        lastAccessed: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// TTL index: Clean up checkpoints older than 90 days
AgentCheckpointSchema.index({ lastAccessed: 1 }, { expireAfterSeconds: 7776000 });

// Compound index for efficient queries
AgentCheckpointSchema.index({ owner: 1, customerPhone: 1 });

export default mongoose.models.AgentCheckpoint || 
    mongoose.model<IAgentCheckpoint>("AgentCheckpoint", AgentCheckpointSchema);
