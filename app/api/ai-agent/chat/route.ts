import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/agent/agent";
import AIAgent, { IAIAgent } from "@/models/ai-agent";

export async function POST(req: NextRequest) {
    try {
        const { ownerId, message } = await req.json();

        if (!ownerId || !message) {
        return NextResponse.json({ error: "Missing ownerId or message" }, { status: 400 });
        }

        // Find AI agent for this owner (enabled status not required)
        const agent = await AIAgent.findOne({ owner: ownerId }).lean<IAIAgent>();
        if (!agent) {
        return NextResponse.json({ error: "No AI agent or linked account found for this user" }, { status: 404 });
        }

        // const accountId = agent.account.toString();

        // Generate AI response
        const reply = await generateAIResponse(ownerId, message);

        if (!reply) {
        return NextResponse.json({ error: "No response from AI agent" }, { status: 500 });
        }

        return NextResponse.json({ reply });
    } catch (err) {
        console.error("Chat agent error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
