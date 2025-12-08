import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import ShopifyStore from "@/models/integration/shopifyStore";
import crypto from "crypto";

function generate6CharToken(): string {
    // Generate a 6-character token using a base62 charset (alphanumeric)
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(6);
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += chars[bytes[i] % chars.length];
    }
    return token;
}

// GET - retrieve the shopify store for current session owner
export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const store = await ShopifyStore.findOne({ owner: session.user.id });
    if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ store });
}

// POST - create or replace the shopify store for current owner
export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const payload = await req.json();
        const { token, connect } = payload || {};

        // Generate a 6-character token if not provided
        const generatedToken = token || generate6CharToken();

        let store = await ShopifyStore.findOne({ owner: session.user.id });
        if (store) {
            store.token = generatedToken;
            if (typeof connect === "boolean") store.connect = connect;
            await store.save();
        } else {
            store = await ShopifyStore.create({
                owner: session.user.id,
                token: generatedToken,
                connect: typeof connect === "boolean" ? connect : false,
            });
        }

        return NextResponse.json({ success: true, store });
    } catch (err: any) {
        console.error("Error in shopify store POST:", err);
        return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
}

// PUT - partial update
export async function PUT(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const updates = await req.json();
        if (!updates || typeof updates !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });

        const store = await ShopifyStore.findOne({ owner: session.user.id });
        if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (updates.token) store.token = updates.token;
        if (typeof updates.connect === "boolean") store.connect = updates.connect;

        await store.save();
        return NextResponse.json({ success: true, store });
    } catch (err: any) {
        console.error("Error in shopify store PUT:", err);
        return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
}

// DELETE - remove shopify store for current owner
export async function DELETE(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const deleted = await ShopifyStore.findOneAndDelete({ owner: session.user.id });
        if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Error deleting shopify store:", err);
        return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
}
