import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import Notification from '@/models/notification';

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { ids } = await req.json();
        await connectDB();
        await Notification.updateMany({ _id: { $in: ids || [] }, recipient: session.user.id }, { $set: { read: true } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Notifications mark-read error:', err);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }
}


