import mongoose, { Schema, Document } from "mongoose";

export interface IAgentChunks extends Document {
    owner: string;
    agent: string;
    chunks: {
        embedding: number[];
        content: string;
    }[];
}

const AgentChunksSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        agent: { type: Schema.Types.ObjectId, ref: "AIAgent", required: true },
        chunks: [
        {
            embedding: { type: [Number], required: true },
            content: { type: String, required: true },
        },
        ],
    },
    { timestamps: true }
);

export default mongoose.models.AgentChunks ||
    mongoose.model("AgentChunks", AgentChunksSchema);
