
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
        try {
        await connectDB();

        // 1️⃣ Resolve agent ID
        const agentId = await getAgentIdByOwner(ownerId);
        if (!agentId) return `No AI agent found for owner ${ownerId}.`;

        // 2️⃣ Embed the query using Mistral
        const embeddingRes = await mistralClient.embeddings.create({
            model: "mistral-embed",
            inputs: [query],
        });

        const queryEmbedding = embeddingRes.data?.[0]?.embedding;
        if (!queryEmbedding) return "Failed to generate embedding for query.";

        // 3️⃣ Retrieve brand knowledge (agent chunks)
        const agentDoc: IAgentChunks | null = await AgentChunks.findOne({ agent: agentId });
        if (!agentDoc || !agentDoc.chunks?.length)
            return "No brand information has been uploaded yet for this owner.";

        // 4️⃣ Compute similarity for all chunks
        const scored = agentDoc.chunks.map((chunk) => ({
            content: chunk.content,
            score: cosineSimilarity(queryEmbedding, chunk.embedding),
        }));

        // 5️⃣ Sort and select top 3
        const top = scored.sort((a, b) => b.score - a.score).slice(0, 3);
        if (!top.length) return "No relevant information found.";


        // 6️⃣ Format output as plain readable text (for LLM)
        const formatted = top
            .map(
            (t, i) =>
                `(${i + 1}) ${t.content.replace(/\s+/g, " ").trim()} [relevance: ${t.score.toFixed(3)}]`
            )
            .join("\n");

        return `\n${formatted}`;
        } catch (err: any) {
        console.error("[brandInfoRetrievalTool] Error:", err);
        return "An internal error occurred while retrieving brand information.";
        }
    },
    {
        name: "brand_info_retrieval",
        description:
        "Use this tool whenever a customer asks you something about your owner's brand, products, or policies. " +
        "It searches through the brand's uploaded knowledge (manuals, FAQs, documents) and returns the most relevant passages. " +
        "Always use this tool before answering if the question concerns the owner's brand or business.",
        schema: z.object({
        ownerId: z.string().describe("The owner's ID"),
        query: z.string().describe("The customer's question about the brand"),
        }),
    }
);
