import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import YouCanStore from "@/models/youcanStore";
import crypto from "crypto";

function generate6CharToken(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(6);
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += chars[bytes[i] % chars.length];
    }
    return token;
}

function generateClientCredentials() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const idBytes = crypto.randomBytes(12);
    let clientId = '';
    for (let i = 0; i < 12; i++) clientId += chars[idBytes[i] % chars.length];
    const clientSecret = crypto.randomBytes(32).toString('hex');
    return { clientId, clientSecret };
}

export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const store = await YouCanStore.findOne({ owner: session.user.id });
    if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ store });
}

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const payload = await req.json();
        const { token, connect } = payload || {};
        const generatedToken = token || generate6CharToken();

        let store = await YouCanStore.findOne({ owner: session.user.id });
        if (store) {
            store.token = generatedToken;
            if (typeof connect === "boolean") store.connect = connect;
            // Ensure client credentials exist
            if (!store.clientId || !store.clientSecret) {
                const creds = generateClientCredentials();
                store.clientId = creds.clientId;
                store.clientSecret = creds.clientSecret;
            }
            await store.save();
        } else {
            const creds = generateClientCredentials();
            store = await YouCanStore.create({ owner: session.user.id, token: generatedToken, connect: typeof connect === "boolean" ? connect : false, clientId: creds.clientId, clientSecret: creds.clientSecret });
            console.info('[YouCan Store] created credentials for owner', session.user.id);
        }

        return NextResponse.json({ success: true, store });
    } catch (err: any) {
        console.error("Error in youcan store POST:", err);
        return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const updates = await req.json();
        if (!updates || typeof updates !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });

        const store = await YouCanStore.findOne({ owner: session.user.id });
        if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (updates.token) store.token = updates.token;
        if (typeof updates.connect === "boolean") store.connect = updates.connect;
        // Support regenerating client secret securely
        if (updates.regenerateSecret === true) {
            store.clientSecret = crypto.randomBytes(32).toString('hex');
            console.info('[YouCan Store] regenerated clientSecret for owner', session.user.id);
        }

        // Ensure clientId/clientSecret exist for older stores
        if (!store.clientId || !store.clientSecret) {
            const creds = generateClientCredentials();
            store.clientId = store.clientId || creds.clientId;
            store.clientSecret = store.clientSecret || creds.clientSecret;
        }

        await store.save();
        return NextResponse.json({ success: true, store });
    } catch (err: any) {
        console.error("Error in youcan store PUT:", err);
        return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const deleted = await YouCanStore.findOneAndDelete({ owner: session.user.id });
        if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Error deleting youcan store:", err);
        return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
}
