// app/api/whatsapp/account/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import crypto from "crypto";

// ------------------------
// Encrypt WhatsApp token or webhook secret
// ------------------------
function encryptToken(token: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        "aes-256-ctr",
        Buffer.from(process.env.ENCRYPTION_KEY!, "hex"),
        iv
    );
    const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// ------------------------
// Generate a random webhook verify token for user
// ------------------------
function generateWebhookVerifyToken(): string {
    // Generate a secure random token (6 bytes = 12 hex characters)
    return crypto.randomBytes(6).toString('hex');
}

// ------------------------
// GET: Retrieve account for logged-in user
// ------------------------
export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure WhatsApp feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(session.user.id, 'whatsapp');
    if (check) return check;

    const account = await WhatsAppAccount.findOne({ owner: session.user.id });

        if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });                                                                    

    return NextResponse.json({ account }, {
        headers: {
            "Cache-Control": "private, s-maxage=180, stale-while-revalidate=300",
        },
    });
}

// ------------------------
// POST: Create or replace account
// ------------------------
export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure WhatsApp feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(session.user.id, 'whatsapp');
    if (check) return check;

    try {
        const {
            waBusinessId,
            waNumberId,
            waNumber,
            waToken,
            metaAppId,
            webhookSecret,
            settings,
            aiConfig,
            preferredTemplates,
        } = await req.json();

        if (!waBusinessId || !waNumber || !waToken) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const waTokenEncrypted = encryptToken(waToken);
        
        // Encrypt webhook secret if provided
        let webhookSecretEncrypted = undefined;
        if (webhookSecret) {
            webhookSecretEncrypted = encryptToken(webhookSecret);
        }

        // Default settings and templates
        const defaultSettings = {
            autoReply: false,
            ad: false,
            aiAgent: false,
            ...settings,
        };

        const defaultTemplates = {
            greeting: null,
            ad: null,
            ...preferredTemplates,
        };

        let account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (account) {
            // ✅ FIX: Check for duplicate waNumberId before updating
            if (waNumberId && waNumberId !== account.waNumberId) {
                const existingAccount = await WhatsAppAccount.findOne({ 
                    waNumberId: waNumberId,
                    _id: { $ne: account._id } // Exclude current account
                });
                if (existingAccount) {
                    return NextResponse.json(
                        { error: `WhatsApp Number ID ${waNumberId} is already in use by another account` },
                        { status: 409 }
                    );
                }
            }

            // Update existing account
            account.waBusinessId = waBusinessId;
            account.waNumberId = waNumberId;
            account.waNumber = waNumber;
            account.waTokenEncrypted = waTokenEncrypted;
            if (metaAppId !== undefined) account.metaAppId = metaAppId;
            
            // Update webhook secret if provided (webhookVerifyToken is auto-generated and cannot be changed)
            if (webhookSecretEncrypted !== undefined) {
                account.webhookSecretEncrypted = webhookSecretEncrypted || null;
            }
            
            account.settings = { ...account.settings, ...defaultSettings };
            if (aiConfig)
                account.aiConfig = { ...account.aiConfig, ...aiConfig };
            account.preferredTemplates = {
                ...account.preferredTemplates,
                ...defaultTemplates,
            };
            account.active = true; // Ensure active is true when updated
            await account.save();
            
            // ✅ Auto-link existing AI agent to this WhatsApp account
            const AIAgent = (await import("@/models/ai-agent")).default;
            const existingAgent = await AIAgent.findOne({ owner: session.user.id });
            if (existingAgent && !existingAgent.account) {
                existingAgent.account = account._id;
                await existingAgent.save();
                console.log(`[WhatsApp Account] Auto-linked AI agent to WhatsApp account ${account._id}`);
            }
        } else {
            // Create new account - generate a random webhook verify token for this user
            const generatedVerifyToken = generateWebhookVerifyToken();
            
            account = await WhatsAppAccount.create({
                owner: session.user.id,
                waBusinessId,
                waNumberId,
                waNumber,
                waTokenEncrypted,
                metaAppId: metaAppId || null,
                webhookVerifyToken: generatedVerifyToken, // Auto-generated for new accounts
                webhookSecretEncrypted: webhookSecretEncrypted || null,
                verified: false,
                status: "disconnected",
                settings: defaultSettings,
                aiConfig: aiConfig || { personality: "friendly assistant" },
                preferredTemplates: defaultTemplates,
                active: true, // Set active when WhatsApp account is created
            });
            
            // ✅ Auto-link existing AI agent to this new WhatsApp account
            const AIAgent = (await import("@/models/ai-agent")).default;
            const existingAgent = await AIAgent.findOne({ owner: session.user.id });
            if (existingAgent && !existingAgent.account) {
                existingAgent.account = account._id;
                await existingAgent.save();
                console.log(`[WhatsApp Account] Auto-linked AI agent to new WhatsApp account ${account._id}`);
            }
        }

        return NextResponse.json({ success: true, account });
    } catch (err: any) {
        console.error("Error saving WhatsApp account:", err);
        
        // ✅ FIX: Handle duplicate key error specifically
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'field';
            return NextResponse.json(
                { error: `Duplicate ${field}: This value is already in use by another account` },
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            { error: err.message || "Server error" },
            { status: 500 }
        );
    }
}

// ------------------------
// PUT: Partial update (settings, aiConfig, templates, webhook fields, etc.)
// ------------------------
export async function PUT(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const {
            waBusinessId,
            waNumberId,
            waNumber,
            waToken,
            metaAppId,
            webhookSecret,
            verified,
            status,
            settings,
            aiConfig,
            preferredTemplates,
        } = await req.json();

        const account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (!account)
            return NextResponse.json({ error: "Account not found" }, { status: 404 });

        // ✅ FIX: Check for duplicate waNumberId before updating
        if (waNumberId && waNumberId !== account.waNumberId) {
            const existingAccount = await WhatsAppAccount.findOne({ 
                waNumberId: waNumberId,
                _id: { $ne: account._id } // Exclude current account
            });
            if (existingAccount) {
                return NextResponse.json(
                    { error: `WhatsApp Number ID ${waNumberId} is already in use by another account` },
                    { status: 409 }
                );
            }
        }

        if (waBusinessId) account.waBusinessId = waBusinessId;
        if (waNumberId) account.waNumberId = waNumberId;
        if (waNumber) account.waNumber = waNumber;
        if (waToken) account.waTokenEncrypted = encryptToken(waToken);
        if (metaAppId !== undefined) account.metaAppId = metaAppId;
        
        // Update webhook secret if provided (webhookVerifyToken is auto-generated and cannot be changed)
        if (webhookSecret !== undefined) {
            // Encrypt webhook secret if provided
            if (webhookSecret) {
                account.webhookSecretEncrypted = encryptToken(webhookSecret);
            } else {
                account.webhookSecretEncrypted = null;
            }
        }
        
        // ✅ FIX: When status is set to "connected", automatically set verified to true
        if (status === "connected") {
            account.status = "connected";
            account.verified = true;
        } else if (status === "disconnected") {
            account.status = "disconnected";
            // Only set verified to false if explicitly provided or if disconnecting
            if (typeof verified === "boolean") {
                account.verified = verified;
            }
        } else if (status) {
            account.status = status;
        }
        
        // Allow explicit verified flag to override only if status is not being set to "connected"
        if (typeof verified === "boolean" && status !== "connected") {
            account.verified = verified;
        }
        if (settings)
            account.settings = { ...account.settings, ...settings };
        if (aiConfig)
            account.aiConfig = { ...account.aiConfig, ...aiConfig };
        if (preferredTemplates)
            account.preferredTemplates = {
                ...account.preferredTemplates,
                ...preferredTemplates,
            };

        await account.save();

        return NextResponse.json({ success: true, account });
    } catch (err: any) {
        console.error("Error updating WhatsApp account:", err);
        
        // ✅ FIX: Handle duplicate key error specifically
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'field';
            return NextResponse.json(
                { error: `Duplicate ${field}: This value is already in use by another account` },
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            { error: err.message || "Server error" },
            { status: 500 }
        );
    }
}

// ------------------------
// PATCH: Update only verification status or nested configs
// ------------------------
export async function PATCH(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const updates = await req.json();
        if (!updates || typeof updates !== "object") {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        // ✅ FIX: Check for duplicate waNumberId before updating
        if (updates.waNumberId && updates.waNumberId !== account.waNumberId) {
            const existingAccount = await WhatsAppAccount.findOne({ 
                waNumberId: updates.waNumberId,
                _id: { $ne: account._id } // Exclude current account
            });
            if (existingAccount) {
                return NextResponse.json(
                    { error: `WhatsApp Number ID ${updates.waNumberId} is already in use by another account` },
                    { status: 409 }
                );
            }
        }

        // Merge nested objects safely
        const mergeFields = ["settings", "aiConfig", "preferredTemplates"];
        mergeFields.forEach((field) => {
            if (updates[field] && typeof updates[field] === "object") {
                account[field] = { ...account[field], ...updates[field] };
                delete updates[field];
            }
        });

        Object.keys(updates).forEach((key) => {
            account[key] = updates[key];
        });

        await account.save();

        return NextResponse.json({
            success: true,
            account,
            message: "WhatsApp account updated successfully",
        });
    } catch (err: any) {
        console.error("PATCH /api/whatsapp/account error:", err);
        
        // ✅ FIX: Handle duplicate key error specifically
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'field';
            return NextResponse.json(
                { error: `Duplicate ${field}: This value is already in use by another account` },
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            { error: err.message || "Server error" },
            { status: 500 }
        );
    }
}
