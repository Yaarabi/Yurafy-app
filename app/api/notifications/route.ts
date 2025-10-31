import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import Notification from '@/models/notification';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await connectDB();
        const items = await Notification.find({ recipient: session.user.id }).sort({ createdAt: -1 }).limit(50);
        return NextResponse.json({ notifications: items });
    } catch (err) {
        console.error('Notifications GET error:', err);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { recipientId, title, message, type } = await req.json();
        if (!recipientId || !title || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        await connectDB();
        const created = await Notification.create({ recipient: recipientId, title, message, type: type || 'system' });
        return NextResponse.json({ notification: created }, { status: 201 });
    } catch (err) {
        console.error('Notifications POST error:', err);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}


