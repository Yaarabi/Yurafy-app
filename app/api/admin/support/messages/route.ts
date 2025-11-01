import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import SupportMessage from '@/models/support';
import mongoose from 'mongoose';

/**
 * GET /api/admin/support/messages
 * - Get all messages for a specific user
 * - Query params: ?userId=user_id
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
        }

        const messages = await SupportMessage.find({
            owner: new mongoose.Types.ObjectId(userId),
        })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching user messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

