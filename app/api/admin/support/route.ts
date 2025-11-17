import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import SupportMessage from '@/models/support';
import User from '@/models/users';

// GET: list conversations grouped by user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const pipeline = [
            { $sort: { createdAt: -1 } },
            { $group: { _id: '$owner', lastMessage: { $first: '$$ROOT' }, count: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $project: { userId: '$_id', count: 1, lastMessage: 1, user: { username: '$user.username', email: '$user.email' } } }
        ];

        const conversations = await (SupportMessage as any).aggregate(pipeline);
        return NextResponse.json({ conversations });
    } catch (err) {
        console.error('Admin support list error:', err);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}

// POST: reply to a user (creates a bot/admin message)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { ownerId, text } = await req.json();
        if (!ownerId || !text) {
            return NextResponse.json({ error: 'ownerId and text are required' }, { status: 400 });
        }

        await connectDB();
        const message = await SupportMessage.create({ owner: ownerId, role: 'bot', text });
        return NextResponse.json({ message });
    } catch (err) {
        console.error('Admin support reply error:', err);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

// DELETE: delete a conversation and all its messages
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        await connectDB();
        const result = await SupportMessage.deleteMany({ owner: userId });
        
        return NextResponse.json({ 
            message: 'Conversation deleted successfully',
            deletedCount: result.deletedCount 
        });
    } catch (err) {
        console.error('Admin support delete error:', err);
        return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }
}


