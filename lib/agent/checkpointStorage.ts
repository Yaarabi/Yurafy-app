import { connectDB } from "@/lib/db/mongoDB";
import AgentCheckpoint from "@/models/agentCheckpoint";
import { MemorySaver } from "@langchain/langgraph";

/**
 * Database-backed checkpoint saver for persistent agent conversation state
 * Replaces in-memory MemorySaver for customer agents to prevent data loss on restart
 * Uses MemorySaver interface pattern with database persistence
 */
export class DatabaseCheckpointSaver {
    async put(threadId: string, checkpoint: any): Promise<void> {
        await connectDB();
        
        // Extract owner and customerPhone from threadId format: wa-{ownerId}-{customerPhone}
        const parts = threadId.split('-');
        const owner = parts.length >= 3 ? parts[1] : null;
        const customerPhone = parts.length >= 3 ? parts.slice(2).join('-') : null;

        await AgentCheckpoint.findOneAndUpdate(
            { threadId },
            {
                threadId,
                checkpoint: JSON.stringify(checkpoint),
                owner: owner || null,
                customerPhone: customerPhone || null,
                lastAccessed: new Date(),
                updatedAt: new Date(),
            },
            { upsert: true }
        );
    }

    async get(threadId: string): Promise<any | null> {
        await connectDB();
        const doc = await AgentCheckpoint.findOne({ threadId });

        if (doc) {
            // Update lastAccessed
            doc.lastAccessed = new Date();
            await doc.save();
            return JSON.parse(doc.checkpoint);
        }

        return null;
    }

    async list(threadIdPrefix?: string): Promise<string[]> {
        await connectDB();
        const filter = threadIdPrefix
            ? { threadId: new RegExp(`^${threadIdPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }
            : {};
        const docs = await AgentCheckpoint.find(filter).select("threadId").lean();
        return docs.map(d => d.threadId);
    }
}
