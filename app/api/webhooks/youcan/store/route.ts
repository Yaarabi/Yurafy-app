import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import YouCanStore from "@/models/youcanStore";
import crypto from "crypto";

async function registerWebhook(clientId: string, clientSecret: string, token: string) {
    const base = process.env.NEXTAUTH_URL;
    if (!base) throw new Error('NEXTAUTH_URL not configured');
    const targetUrl = `${base.replace(/\/$/, '')}/api/webhooks/youcan/new-order/${token}`;

    const url = 'https://api.youcan.shop/resthooks/subscribe';
    const body = { event: 'order.create', target_url: targetUrl };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${clientId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    let text: string | object = '';
    try { text = await res.text(); text = text ? JSON.parse(String(text)) : {}; } catch (e) { /* keep raw text */ }

    if (!res.ok) {
        const details = typeof text === 'string' ? text : JSON.stringify(text);
        throw new Error(`YouCan subscription failed: ${res.status} ${res.statusText} - ${details}`);
    }

    return text;
}

function generate6CharToken(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(8);
    let token = '';
    for (let i = 0; i < 8; i++) {
        token += chars[bytes[i] % chars.length];
    }
    return token;
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

    return NextResponse.json({ store });
}

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const payload = await req.json();
        const { token, connect, clientId, clientSecret } = payload || {};

        let store = await YouCanStore.findOne({ owner: session.user.id });
        if (store) {
            // Update provided fields
            if (typeof connect === "boolean") store.connect = connect;
            if (clientId) store.clientId = clientId;
            if (clientSecret) store.clientSecret = clientSecret;

            // Only generate a token if it's missing AND both credentials are present
            if (!store.token && store.clientId && store.clientSecret) {
                store.token = token || generate6CharToken();
            }

            await store.save();
            // If we have full credentials and a token, attempt to register webhook with YouCan
            if (store.clientId && store.clientSecret && store.token) {
                try {
                    await registerWebhook(store.clientId, store.clientSecret, store.token);
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
            // Creating a new store requires clientId and clientSecret supplied by the user
            if (!clientId || !clientSecret) {
                return NextResponse.json({ error: 'clientId and clientSecret are required to create a YouCan store' }, { status: 400 });
            }

            const generatedToken = token || generate6CharToken();
            store = await YouCanStore.create({ owner: session.user.id, token: generatedToken, connect: typeof connect === "boolean" ? connect : false, clientId, clientSecret });

            // Try to register webhook immediately after creating the store
            if (store.clientId && store.clientSecret && store.token) {
                try {
                    await registerWebhook(store.clientId, store.clientSecret, store.token);
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
        if (typeof updates.clientId === 'string' && updates.clientId.trim()) store.clientId = updates.clientId.trim();
        if (typeof updates.clientSecret === 'string' && updates.clientSecret.trim()) store.clientSecret = updates.clientSecret.trim();

        // Only generate a token if it's missing AND both credentials are present
        if (!store.token && store.clientId && store.clientSecret) {
            store.token = generate6CharToken();
        }

        await store.save();

        // If we now have full credentials and a token, attempt to register webhook with YouCan
        if (store.clientId && store.clientSecret && store.token) {
            try {
                await registerWebhook(store.clientId, store.clientSecret, store.token);
                store.connect = true;
                await store.save();
            } catch (err: any) {
                console.error('[YouCan] failed to register webhook on PUT:', err);
                store.connect = false;
                await store.save();
                return NextResponse.json({ error: 'Failed to register webhook with YouCan', details: String(err?.message || err) }, { status: 502 });
            }
        }

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
