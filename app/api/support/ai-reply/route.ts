import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import SupportAgent from "@/models/supportAgent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatMistralAI } from "@langchain/mistralai";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";

/**
 * Agent rules:
 * 1. Detect service or custom idea interest.
 * 2. First guide user to fill the quote form (https://yurafy.com/services).
 * 3. If they confirm they want YOU to proceed, ask for name + contact.
 * 4. Only after collecting both → call “save_support_note” tool.
 * 5. Tool ALWAYS stores visitor name + contact + note summary.
 * 6. Never call the tool without confirmation.
 */
async function generateBotReply(systemPrompt: string, userMessage: string) {
    await connectDB();

    const model = new ChatMistralAI({
        model: "mistral-large-latest",
        apiKey: process.env.MISTRAL_API_KEY,
        temperature: 0.7,
    });

    /**
     * Save Note Tool — ALWAYS requires name + contact + note.
     */
    const saveNoteTool = tool(
        async ({ guestName, contact, note }) => {
            const base = process.env.NEXTAUTH_URL;

            await fetch(`${base}/api/supportagent/notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-internal-call": process.env.INTERNAL_API_KEY || "",
                },
                body: JSON.stringify({ guestName, contact, note }),
            });

            return `The note has been saved successfully.`;
        },
        {
            name: "save_support_note",
            description: `
Store a support note ONLY when:
- The user explicitly confirms they want to proceed with a service or custom idea.
- The assistant already has guestName and contact.
Never call without explicit confirmation.
Always include: { guestName, contact, note }.
`,
            schema: z.object({
                guestName: z.string().min(1),
                contact: z.string().min(5),
                note: z.string().min(5),
            }),
        }
    );

    /**
     * Strict system prompt that forces the agent behavior.
     */
    
    const agent = await createReactAgent({
        llm: model,
        tools: [saveNoteTool],
        checkpointSaver: new MemorySaver(),
        prompt: systemPrompt,
    });

    const res = await agent.invoke(
        { messages: [{ role: "user", content: userMessage }] },
        { configurable: { thread_id: "support-session", recursionLimit: 6 } }
    );

    return res.messages?.at(-1)?.content || "No reply generated.";
}

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { text } = body;
        if (!text)
            return NextResponse.json(
                { error: "Missing text" },
                { status: 400 }
            );

        const cfg = await SupportAgent.findOne();
        const prompt = cfg?.prompt || "Be helpful.";

        const botText = await generateBotReply(prompt, text);

        return NextResponse.json(
            { bot: { role: "bot", text: botText } },
            { status: 201 }
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
