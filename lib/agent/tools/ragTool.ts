
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { connectDB } from "@/lib/db/mongoDB";
import AgentChunks, { IAgentChunks } from "@/models/agentVector"
import { Mistral } from "@mistralai/mistralai";
import axios from "axios";

const mistralClient = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY as string,
});

// Helper: cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

// Helper: resolve agentId from ownerId
async function getAgentIdByOwner(ownerId: string): Promise<string | null> {
    const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/ai-agent?owner=${ownerId}`
    );
    const agent = res.data?.agent;
    return agent?._id || null;
}

// Tool definition
export const brandInfoRetrievalTool = tool(
    async ({ ownerId, query }) => {
        await connectDB();

        // 1. Resolve agentId
        const agentId = await getAgentIdByOwner(ownerId);
        if (!agentId) {
        return `No AI agent found for owner ${ownerId}.`;
        }

        // 2. Embed the query
        const embeddingRes = await mistralClient.embeddings.create({
        model: "mistral-embed",
        inputs: [query],
        });
        const queryEmbedding = embeddingRes.data[0].embedding as number[];

        // 3. Load stored chunks
        const agentDoc: IAgentChunks | null = await AgentChunks.findOne({ agent: agentId });
            if (!agentDoc) {
            return `No brand information has been uploaded yet for this owner.`;
        }

        // 4. Compute similarity
        const scored = agentDoc.chunks.map((chunk) => ({
        content: chunk.content,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
        }));

        // 5. Return top 3 matches
        const top = scored.sort((a, b) => b.score - a.score).slice(0, 3);

        return top.map((t) => ({
        content: t.content,
        similarity: t.score.toFixed(3),
        }));
    },
    {
        name: "brand_info_retrieval",
        description:
        "Use this tool whenever a customer asks you something about your owner's brand, products, or policies. " +
        "You will search through the knowledge your owner uploaded (like manuals, FAQs, or brand documents) and return the most relevant passages. " +
        "Always call this tool before answering if the question is about the owner's brand or business.",
        schema: z.object({
        ownerId: z.string().describe("The ID of your owner"),
        query: z.string().describe("The customer's question about the brand"),
        }),
    }
);
