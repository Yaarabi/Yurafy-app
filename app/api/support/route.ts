import { NextRequest, NextResponse } from 'next/server';
import SupportMessage from '@/models/support';
import { connectDB } from '@/lib/db/mongoDB';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import User from '@/models/users';
import Notification from '@/models/notification';

export async function POST(req: NextRequest) {
    await connectDB();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { role, text } = body;

        if (!role || !text) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const message = await SupportMessage.create({
        owner: session.user.id,
        role,
        text,
        });

        // Create notifications for all admin users when a user sends a support message
        // Users should NOT receive notifications for their own messages
        if (role === 'user') {
            try {
                const adminUsers = await User.find({ role: 'admin' }).select('_id');
                const notifications = adminUsers.map(admin => ({
                    owner: admin._id,
                    type: 'support_reply' as const,
                    title: 'New Support Message',
                    message: text.substring(0, 100),
                    link: `/admin/support?userId=${session.user.id}`,
                    read: false,
                }));

                if (notifications.length > 0) {
                    await Notification.insertMany(notifications);
                }
            } catch (notifError) {
                console.error('Error creating admin notifications:', notifError);
                // Don't fail the message creation if notification fails
            }
        }

        return NextResponse.json(message, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    await connectDB();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const messages = await SupportMessage.find({ owner: session.user.id }).sort({ createdAt: 1 });
        return NextResponse.json(messages, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
