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
// GET account
// ------------------------
export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const account = await WhatsAppAccount.findOne({ owner: session.user.id });
    if (!account) return NextResponse.json({ error: "No account found" }, { status: 404 });

    return NextResponse.json({ account });
}

// ------------------------
// POST: create or replace
// ------------------------
export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const {
            waBusinessId,
            waNumberId,
            waNumber,
            waToken,
            settings,
            templates,
            aiConfig,
        } = await req.json();

        if (!waBusinessId || !waNumber || !waToken) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const waTokenEncrypted = encryptToken(waToken);

        let account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (account) {
            account.waBusinessId = waBusinessId;
            account.waNumberId = waNumberId;
            account.waNumber = waNumber;
            account.waTokenEncrypted = waTokenEncrypted;
            if (settings) account.settings = { ...account.settings, ...settings };
            if (templates) account.templates = { ...account.templates, ...templates };
            if (aiConfig) account.aiConfig = { ...account.aiConfig, ...aiConfig };
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
                templates: templates || {},
                aiConfig: aiConfig || {},
            });
        }

        return NextResponse.json({ success: true, account });
    } catch (err) {
        console.error("Error saving WhatsApp account:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// ------------------------
// PUT: update account partially
// ------------------------
export async function PUT(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const {
            waBusinessId,
            waNumberId,
            waNumber,
            waToken,
            verified,
            status,
            settings,
            templates,
            aiConfig,
        } = await req.json();

        const account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

        if (waBusinessId) account.waBusinessId = waBusinessId;
        if (waNumberId) account.waNumberId = waNumberId;
        if (waNumber) account.waNumber = waNumber;
        if (waToken) account.waTokenEncrypted = encryptToken(waToken);
        if (typeof verified === "boolean") account.verified = verified;
        if (status) account.status = status;
        if (settings) account.settings = { ...account.settings, ...settings };
        if (templates) account.templates = { ...account.templates, ...templates };
        if (aiConfig) account.aiConfig = { ...account.aiConfig, ...aiConfig };

        await account.save();

        return NextResponse.json({ success: true, account });
    } catch (err) {
        console.error("Error updating WhatsApp account:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// ------------------------
// PATCH: update verified status
// ------------------------
export async function PATCH(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { verified } = await req.json();
        const account = await WhatsAppAccount.findOneAndUpdate(
            { owner: session.user.id },
            { $set: { verified } },
            { new: true }
        );
        if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

        return NextResponse.json({ success: true, account });
    } catch (err) {
        console.error("Error updating WhatsApp account:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
