
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import AIAgent from "@/models/automation/ai-agent";
import AgentChunks from "@/models/automation/agentVector"
import { processAgentEmbedding } from "@/lib/embedding/agentProcessor";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const owner = searchParams.get("owner");
        if (!owner) return NextResponse.json({ error: "Missing owner" }, { status: 400 });

        const vectors = await AgentChunks.find({ owner });
        return NextResponse.json({ vectors });
    } catch (err) {
        console.error("GET embed error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { agentId } = body;
        if (!agentId) return NextResponse.json({ error: "Missing agentId" }, { status: 400 });

        const agent = await AIAgent.findById(agentId);
        if (!agent || !agent.file) return NextResponse.json({ error: "Agent or file not found" }, { status: 404 });

        await processAgentEmbedding(agent);
        return NextResponse.json({ message: "Embeddings stored successfully" });
    } catch (err) {
        console.error("POST embed error:", err);
        return NextResponse.json({ error: "Embedding failed" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const agentId = searchParams.get("agentId");
        if (!agentId) return NextResponse.json({ error: "Missing agentId" }, { status: 400 });

        await AgentChunks.deleteOne({ agent: agentId });
        return NextResponse.json({ message: "Embeddings deleted" });
    } catch (err) {
        console.error("DELETE embed error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
