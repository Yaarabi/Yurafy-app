import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import crypto from "crypto";

// ------------------------
// Encrypt WhatsApp token
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
// GET: Retrieve account for logged-in user
// ------------------------
export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const account = await WhatsAppAccount.findOne({ owner: session.user.id });
    if (!account)
        return NextResponse.json({ error: "No account found" }, { status: 404 });

    return NextResponse.json({ account });
    }

    // ------------------------
    // POST: Create or replace account
    // ------------------------
    export async function POST(req: NextRequest) {
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

        let account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (account) {
        account.waBusinessId = waBusinessId;
        account.waNumberId = waNumberId;
        account.waNumber = waNumber;
        account.waTokenEncrypted = waTokenEncrypted;
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
        } else {
        account = await WhatsAppAccount.create({
            owner: session.user.id,
            waBusinessId,
            waNumberId,
            waNumber,
            waTokenEncrypted,
            verified: false,
            status: "disconnected",
            settings: settings || {},
            aiConfig: aiConfig || {},
            preferredTemplates: preferredTemplates || {},
        });
        }

        return NextResponse.json({ success: true, account });
    } catch (err) {
        console.error("Error saving WhatsApp account:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// ------------------------
// PUT: Partial update (settings, aiConfig, templates, etc.)
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
        verified,
        status,
        settings,
        aiConfig,
        preferredTemplates,
        } = await req.json();

        const account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (!account)
        return NextResponse.json({ error: "Account not found" }, { status: 404 });

        if (waBusinessId) account.waBusinessId = waBusinessId;
        if (waNumberId) account.waNumberId = waNumberId;
        if (waNumber) account.waNumber = waNumber;
        if (waToken) account.waTokenEncrypted = encryptToken(waToken);
        if (typeof verified === "boolean") account.verified = verified;
        if (status) account.status = status;
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
    } catch (err) {
        console.error("Error updating WhatsApp account:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// ------------------------
// PATCH: Update only verification status
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

        // Dynamically merge top-level objects
        const mergeFields = ["settings", "aiConfig", "preferredTemplates"];
        mergeFields.forEach((field) => {
        if (updates[field] && typeof updates[field] === "object") {
            account[field] = { ...account[field], ...updates[field] };
            delete updates[field]; // remove so it doesn’t overwrite as top-level
        }
        });

        // Update any remaining fields directly (for strings, booleans, arrays)
        Object.keys(updates).forEach((key) => {
        account[key] = updates[key];
        });

        await account.save();

        return NextResponse.json({
        success: true,
        account,
        message: "WhatsApp account updated successfully",
        });
    } catch (err) {
        console.error("PATCH /api/whatsapp/account error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    }

