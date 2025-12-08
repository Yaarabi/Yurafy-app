import axios from "axios";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Mistral } from "@mistralai/mistralai";
import AgentChunks from "@/models/automation/agentVector"
import { IAIAgent } from "@/models/automation/ai-agent";

//

const mistralClient = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY as string,
});


export async function fetchTextFromFile(url: string): Promise<string> {
    const res = await axios.get(url);
    return res.data;
}

export async function splitText(text: string): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 250,
        chunkOverlap: 40,
    });
    const output = await splitter.createDocuments([text]);
    return output.map((doc) => doc.pageContent);
}

export async function embedChunks(chunks: string[]) {
    const embeddings = await mistralClient.embeddings.create({
        model: "mistral-embed",
        inputs: chunks,
    });

    return chunks
        .map((chunk, i) => ({
        content: chunk,
        embedding: embeddings.data[i].embedding,
        }))
        .filter(
        (item): item is { content: string; embedding: number[] } =>
            Array.isArray(item.embedding)
        );
}


export async function storeEmbeddings(agent: IAIAgent, data: { content: string; embedding: number[] }[]) {
  // Replace existing embeddings for this agent
    await AgentChunks.findOneAndUpdate(
        { agent: agent._id },
        {
        owner: agent.owner,
        agent: agent._id,
        chunks: data,
        },
        { upsert: true, new: true }
    );
}

export async function processAgentEmbedding(agent: IAIAgent) {
    if (!agent.file) throw new Error("Agent has no file URL");

    const text = await fetchTextFromFile(agent.file);
    const chunks = await splitText(text);
    const embedded = await embedChunks(chunks);
    await storeEmbeddings(agent, embedded);
}
