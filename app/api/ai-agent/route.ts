import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import AIAgent from "@/models/ai-agent";
import WhatsAppAccount from "@/models/whatsappAccount";
import mongoose from "mongoose";

/** Helper to validate ObjectId */
function isValidObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /api/ai-agent?owner=USER_ID
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const owner = searchParams.get("owner");

        if (!owner) return NextResponse.json({ error: "Missing owner" }, { status: 400 });
        if (!isValidObjectId(owner)) return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });

        const agent = await AIAgent.findOne({ owner });
        if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

        return NextResponse.json({ agent });
    } catch (err) {
        console.error("GET AI agent error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

/**
 * POST /api/ai-agent
 * Create a new agent
 */
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { owner, account } = body;

        if (!owner) return NextResponse.json({ error: "Missing owner" }, { status: 400 });
        if (!isValidObjectId(owner)) return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });
        if (account && !isValidObjectId(account)) return NextResponse.json({ error: "Invalid account ID" }, { status: 400 });

        const existing = await AIAgent.findOne({ owner });
        if (existing) return NextResponse.json({ agent: existing, message: "Agent already exists" });

        const agent = await AIAgent.create({
        owner,
        account: account || null,
        enabled: true,
        prompt: "You are a helpful sales assistant.",
        tools: { orderConfirmation: false, sellerMessaging: false, audioAssets: [] },
        memory: { short: [], long: [] },
        });

        // Sync WhatsApp account if exists
        if (account) {
        const waAccount = await WhatsAppAccount.findById(account);
        if (waAccount) {
            waAccount.settings.aiAgent = true;
            await waAccount.save();
        }
        }

        return NextResponse.json({ agent, message: "AI agent created successfully" });
    } catch (err) {
        console.error("POST AI agent error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

/**
 * PUT /api/ai-agent
 * Update an existing agent
 * Automatically syncs `enabled` with the WhatsApp account's settings.aiAgent
 */
export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { owner, prompt, enabled, tools, account } = body;

        if (!owner) return NextResponse.json({ error: "Missing owner" }, { status: 400 });
        if (!isValidObjectId(owner)) return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });

        // Build update object
        const updateData: any = {};
        if (typeof prompt === "string") updateData.prompt = prompt;
        if (typeof enabled === "boolean") updateData.enabled = enabled;
        if (tools) updateData.tools = tools;
        if (account && isValidObjectId(account)) updateData.account = account;

        // Update or create AI Agent
        const agent = await AIAgent.findOneAndUpdate(
        { owner },
        updateData,
        { new: true, upsert: true }
        );

        // Sync with WhatsApp account's aiAgent setting
        if (agent?.account) {
        const waAccount = await WhatsAppAccount.findById(agent.account);
        if (waAccount) {
            waAccount.settings.aiAgent = agent.enabled;
            await waAccount.save();
        }
        }

        return NextResponse.json({ agent, message: "AI agent updated and WhatsApp account synced successfully" });
    } catch (err) {
        console.error("PUT AI agent error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
