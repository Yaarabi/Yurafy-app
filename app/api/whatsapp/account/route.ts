import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import crypto from "crypto";

function encryptToken(token: string) {
    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipheriv(
        "aes-256-ctr",
        Buffer.from(process.env.ENCRYPTION_KEY!, "hex"),
        iv
    );
    const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);

    // store as iv:ciphertext
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}


// GET account
export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const account = await WhatsAppAccount.findOne({ owner: session.user.id });
    if (!account) return NextResponse.json({ error: "No account found" }, { status: 404 });

    return NextResponse.json({ account });
}

// POST create/update (create or replace)
export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { waBusinessId, waNumberId, waNumber, waToken } = await req.json();
        if (!waBusinessId || !waNumber || !waToken) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const waTokenEncrypted = encryptToken(waToken);

        let account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (account) {
            account.waBusinessId = waBusinessId;
            account.waNumberId = waNumberId;
            account.waNumber = waNumber;
            account.waTokenEncrypted = waTokenEncrypted;
            await account.save();
        } else {
            account = await WhatsAppAccount.create({
                owner: session.user.id,
                waBusinessId,
                waNumberId,
                waNumber,
                waTokenEncrypted,
                verified: false,
            });
        }

        return NextResponse.json({ success: true, account });
    } catch (err) {
        console.error("Error saving WhatsApp account:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PUT: update existing account (partial or full replace semantics as you wish)
export async function PUT(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // parse incoming JSON (only update fields provided)
        const {
            waBusinessId,
            waNumberId,
            waNumber,
            waToken,
            verified,
            botEnabled,
            botTemplate,
        } = await req.json();

        // Find existing account
        const account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

        // Update provided fields
        if (typeof waBusinessId === "string" && waBusinessId.trim() !== "") account.waBusinessId = waBusinessId;
        if (typeof waNumberId === "string" && waNumberId.trim() !== "") account.waNumberId = waNumberId;
        if (typeof waNumber === "string" && waNumber.trim() !== "") account.waNumber = waNumber;

        // Re-encrypt token if provided
        if (typeof waToken === "string" && waToken.trim() !== "") {
            account.waTokenEncrypted = encryptToken(waToken);
        }

        if (typeof verified === "boolean") account.verified = verified;
        if (typeof botEnabled === "boolean") account.botEnabled = botEnabled;
        if (typeof botTemplate === "string") account.botTemplate = botTemplate;

        await account.save();

        return NextResponse.json({ success: true, account });
    } catch (err) {
        console.error("Error updating WhatsApp account:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// -------------------
// PATCH verification
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
