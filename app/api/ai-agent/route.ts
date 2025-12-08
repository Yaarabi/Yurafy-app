import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import AIAgent from "@/models/automation/ai-agent";
import WhatsAppAccount from "@/models/automation/whatsappAccount";
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

        // Serialize enabledTools Map to object for JSON response
        const agentObj = agent.toObject();
        if (agentObj.enabledTools && agentObj.enabledTools instanceof Map) {
            agentObj.enabledTools = Object.fromEntries(agentObj.enabledTools);
        } else if (!agentObj.enabledTools) {
            agentObj.enabledTools = {};
        }

        return NextResponse.json({ agent: agentObj });
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
        const { owner, account, templates = [], file, prompt, memory } = body;

        // 🧩 Validate owner
        if (!owner) {
        return NextResponse.json({ error: "Missing owner" }, { status: 400 });
        }
        if (!isValidObjectId(owner)) {
        return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });
        }

        // 🧩 Validate account (if provided)
        if (account && !isValidObjectId(account)) {
        return NextResponse.json({ error: "Invalid account ID" }, { status: 400 });
        }

        // 🧩 Check if agent already exists
        const existing = await AIAgent.findOne({ owner });
        if (existing) {
        return NextResponse.json({
            agent: existing,
            message: "Agent already exists",
        });
        }

        // 🧩 Auto-find WhatsApp account if not provided
        let waAccountId = account || null;
        if (!waAccountId) {
            // Automatically find owner's WhatsApp account
            const waAccount = await WhatsAppAccount.findOne({ owner, status: "connected" });
            if (waAccount) {
                waAccountId = waAccount._id.toString();
                console.log(`[AI Agent] Auto-assigned WhatsApp account ${waAccountId} to owner ${owner}`);
            }
        }

        // 🧩 Validate file (string URL, optional)
        if (file && typeof file !== "string") {
        return NextResponse.json(
            { error: "File must be a string URL" },
            { status: 400 }
        );
        }

        // 🧩 Handle memory (string summary only)
        let memoryValue = "";
        if (typeof memory === "string") {
        memoryValue = memory;
        } else if (typeof memory === "object" && memory !== null) {
        // stringify if object was sent by mistake
        memoryValue = JSON.stringify(memory);
        }

        // 🧩 Create the AI agent
        const agent = await AIAgent.create({
        owner,
        account: waAccountId,
        enabled: true,
        prompt: typeof prompt === "string" ? prompt : "You are a helpful sales assistant.",
        templates: Array.isArray(templates) ? templates : [],
        memory: memoryValue,
        file: typeof file === "string" ? file : "",
        active: true, // Set active when AI agent is created
        });

        // 🧩 Sync WhatsApp account settings if linked
        if (waAccountId) {
        const waAccount = await WhatsAppAccount.findById(waAccountId);
        if (waAccount) {
            waAccount.settings.aiAgent = true;
            await waAccount.save();
            console.log(`[AI Agent] Enabled AI agent setting for WhatsApp account ${waAccountId}`);
        }
        }

        return NextResponse.json({
        agent,
        message: "AI agent created successfully",
        });
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
        const { owner, prompt, enabled, file, account } = body;

        if (!owner) return NextResponse.json({ error: "Missing owner" }, { status: 400 });
        if (!isValidObjectId(owner)) return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });

        // Build update object
        const updateData: any = {};
        if (typeof prompt === "string") updateData.prompt = prompt;
        if (typeof enabled === "boolean") updateData.enabled = enabled;
        if (file?.url) updateData.file = { url: file.url};
        if (account && isValidObjectId(account)) {
            updateData.account = account;
        } else if (!account) {
            // If account is not provided, try to auto-find owner's WhatsApp account
            const existingAgent = await AIAgent.findOne({ owner });
            if (!existingAgent || !existingAgent.account) {
                const waAccount = await WhatsAppAccount.findOne({ owner, status: "connected" });
                if (waAccount) {
                    updateData.account = waAccount._id;
                    console.log(`[AI Agent PUT] Auto-assigned WhatsApp account ${waAccount._id} to owner ${owner}`);
                }
            }
        }

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
            console.log(`[AI Agent PUT] Synced AI agent setting with WhatsApp account ${agent.account}`);
        }
        }

        return NextResponse.json({ agent, message: "AI agent updated and WhatsApp account synced successfully" });
    } catch (err) {
        console.error("PUT AI agent error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { owner, account, enabled, prompt, templates, memory, file, enabledTools } = body;

        if (!owner) {
        return NextResponse.json({ error: "Missing owner ID" }, { status: 400 });
        }
        if (!isValidObjectId(owner)) {
        return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });
        }

        const agent = await AIAgent.findOne({ owner });
        if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Apply updates if provided
        if (account && isValidObjectId(account)) agent.account = account;
        if (typeof enabled === "boolean") agent.enabled = enabled;
        if (typeof prompt === "string") agent.prompt = prompt;
        if (Array.isArray(templates)) agent.templates = templates;
        if (typeof memory === "string") agent.memory = memory;
        if (typeof file === "string") agent.file = file;
        
        // Handle enabledTools - convert object to Map if provided
        if (enabledTools && typeof enabledTools === "object" && enabledTools !== null) {
            // Clear existing enabledTools map
            if (agent.enabledTools) {
                agent.enabledTools.clear();
            } else {
                // Initialize as Map if it doesn't exist
                agent.enabledTools = new Map();
            }
            
            // Set each tool's enabled status
            Object.entries(enabledTools).forEach(([toolName, isEnabled]) => {
                if (typeof isEnabled === "boolean") {
                    agent.enabledTools.set(toolName, isEnabled);
                }
            });
        }

        await agent.save();

        // Clear agent cache if enabledTools were updated
        if (enabledTools) {
            const { clearAgentCache } = await import("@/lib/agent/agent");
            clearAgentCache(owner);
        }

        // Serialize enabledTools Map to object for JSON response
        const agentObj = agent.toObject();
        if (agentObj.enabledTools && agentObj.enabledTools instanceof Map) {
            agentObj.enabledTools = Object.fromEntries(agentObj.enabledTools);
        } else if (!agentObj.enabledTools) {
            agentObj.enabledTools = {};
        }

        return NextResponse.json({ agent: agentObj, message: "Agent updated successfully" });
    } catch (err) {
        console.error("PATCH AI agent error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}


// Delet the Agent

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const owner = searchParams.get("owner");

        if (!owner) {
        return NextResponse.json({ error: "Missing owner ID" }, { status: 400 });
        }

        if (!isValidObjectId(owner)) {
        return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });
        }

        // Find the agent
        const agent = await AIAgent.findOne({ owner });
        if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Delete the agent
        await AIAgent.deleteOne({ owner });

        // Optionally sync WhatsApp account if linked
        if (agent.account) {
        const waAccount = await WhatsAppAccount.findById(agent.account);
        if (waAccount) {
            waAccount.settings.aiAgent = false;
            await waAccount.save();
        }
        }

        return NextResponse.json({ message: "AI agent deleted successfully" });
    } catch (err) {
        console.error("DELETE AI agent error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

