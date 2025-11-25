import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WooStore from "@/models/wooStore";
import crypto from "crypto";

function generate6CharToken(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(6);
    let token = '';
    for (let i = 0; i < 6; i++) token += chars[bytes[i] % chars.length];
    return token;
}

export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const store = await WooStore.findOne({ owner: session.user.id });
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

        let store = await WooStore.findOne({ owner: session.user.id });
        if (store) {
            store.token = generatedToken;
            if (typeof connect === 'boolean') store.connect = connect;
            await store.save();
        } else {
            store = await WooStore.create({ owner: session.user.id, token: generatedToken, connect: typeof connect === 'boolean' ? connect : false });
        }

        return NextResponse.json({ success: true, store });
    } catch (err: any) {
        console.error('Error saving WooStore:', err);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const updates = await req.json();
        if (!updates || typeof updates !== 'object') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

        const store = await WooStore.findOne({ owner: session.user.id });
        if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (updates.token) store.token = updates.token;
        if (typeof updates.connect === 'boolean') store.connect = updates.connect;
        await store.save();

        return NextResponse.json({ success: true, store });
    } catch (err: any) {
        console.error('Error updating WooStore:', err);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const deleted = await WooStore.findOneAndDelete({ owner: session.user.id });
        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Error deleting WooStore:', err);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
