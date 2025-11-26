import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import YouCanStore from "@/models/youcanStore";
import crypto from "crypto";
import { registerWebhook, unregisterWebhook } from '@/lib/youcan/resthooks';
function generate6CharToken(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(8);
    let token = '';
    for (let i = 0; i < 8; i++) {
        token += chars[bytes[i] % chars.length];
    }
    return token;
}

function sanitizeStore(store: any) {
    if (!store) return null;
    const s = typeof store.toObject === 'function' ? store.toObject() : JSON.parse(JSON.stringify(store));
    // Remove sensitive secrets before sending to clients
    if ('accessToken' in s) delete s.accessToken;
    if ('refreshToken' in s) delete s.refreshToken;
    return s;
}

// Note: clientId and clientSecret are expected to be provided by the user.
// We do NOT auto-generate credentials here. Token (webhook) will only be
// generated once both credentials are present.

export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const store = await YouCanStore.findOne({ owner: session.user.id });
    if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ store: sanitizeStore(store) });
}

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const payload = await req.json();
        const { token, connect, accessToken, refreshToken, expiresAt } = payload || {};

        let store = await YouCanStore.findOne({ owner: session.user.id });
        if (store) {
            // Update provided fields
            if (typeof connect === "boolean") store.connect = connect;
            if (accessToken) store.accessToken = accessToken;
            if (refreshToken) store.refreshToken = refreshToken;
            if (expiresAt) store.expiresAt = new Date(expiresAt);

            // Only generate a token if it's missing AND accessToken is present
            if (!store.token && store.accessToken) {
                store.token = token || generate6CharToken();
            }

            await store.save();
            // If we have access token and a token, attempt to register webhook with YouCan
            if (store.accessToken && store.token) {
                try {
                    const res = await registerWebhook(store.accessToken, store.token);
                    const subId = res?.id || (res && res.id) || null;
                    if (subId) store.subscriptionId = subId;
                    store.connect = true;
                    await store.save();
                } catch (err: any) {
                    console.error('[YouCan] failed to register webhook on POST update:', err);
                    store.connect = false;
                    await store.save();
                    return NextResponse.json({ error: 'Failed to register webhook with YouCan', details: String(err?.message || err) }, { status: 502 });
                }
            }
        } else {
            // Creating a new store requires accessToken supplied by the user (or via OAuth)
            if (!accessToken) {
                return NextResponse.json({ error: 'accessToken is required to create a YouCan store' }, { status: 400 });
            }

            const generatedToken = token || generate6CharToken();
            store = await YouCanStore.create({ owner: session.user.id, token: generatedToken, connect: typeof connect === "boolean" ? connect : false, accessToken, refreshToken, expiresAt: expiresAt ? new Date(expiresAt) : undefined });

            // Try to register webhook immediately after creating the store
            if (store.accessToken && store.token) {
                try {
                    const res = await registerWebhook(store.accessToken, store.token);
                    const subId = res?.id || (res && res.id) || null;
                    if (subId) store.subscriptionId = subId;
                    store.connect = true;
                    await store.save();
                } catch (err: any) {
                    console.error('[YouCan] failed to register webhook on POST create:', err);
                    store.connect = false;
                    await store.save();
                    return NextResponse.json({ error: 'Failed to register webhook with YouCan', details: String(err?.message || err) }, { status: 502 });
                }
            }
        }

        return NextResponse.json({ success: true, store: sanitizeStore(store) });
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
        if (typeof updates.accessToken === 'string' && updates.accessToken.trim()) store.accessToken = updates.accessToken.trim();
        if (typeof updates.refreshToken === 'string' && updates.refreshToken.trim()) store.refreshToken = updates.refreshToken.trim();
        if (typeof updates.expiresAt === 'string' && updates.expiresAt.trim()) store.expiresAt = new Date(updates.expiresAt.trim());

        // Only generate a token if it's missing AND accessToken is present
        if (!store.token && store.accessToken) {
            store.token = generate6CharToken();
        }

        await store.save();

        // If we now have accessToken and a token, attempt to register webhook with YouCan
        if (store.accessToken && store.token) {
            try {
                const res = await registerWebhook(store.accessToken, store.token);
                const subId = res?.id || (res && res.id) || null;
                if (subId) store.subscriptionId = subId;
                store.connect = true;
                await store.save();
            } catch (err: any) {
                console.error('[YouCan] failed to register webhook on PUT:', err);
                store.connect = false;
                await store.save();
                return NextResponse.json({ error: 'Failed to register webhook with YouCan', details: String(err?.message || err) }, { status: 502 });
            }
        }

        return NextResponse.json({ success: true, store: sanitizeStore(store) });
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
        const store = await YouCanStore.findOne({ owner: session.user.id });
        if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // If we have a subscription, try to unsubscribe first
        if (store.subscriptionId && store.accessToken) {
            try {
                await unregisterWebhook(store.subscriptionId, store.accessToken);
            } catch (err: any) {
                console.error('[YouCan] failed to unregister webhook on DELETE:', err);
                // continue to delete local record anyway
            }
        }

        const deleted = await YouCanStore.findOneAndDelete({ owner: session.user.id });
        if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Error deleting youcan store:", err);
        return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
}
