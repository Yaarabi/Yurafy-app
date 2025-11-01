import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import Notification from '@/models/notification';
import mongoose from 'mongoose';

/**
 * GET /api/notifications
 * - Get all notifications for the current user
 * - Optional query params: ?read=true/false, ?limit=10
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const read = searchParams.get('read');
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        const query: any = { owner: session.user.id };
        if (read === 'true') {
            query.read = true;
        } else if (read === 'false') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Count unread
        const unreadCount = await Notification.countDocuments({
            owner: session.user.id,
            read: false,
        });

        return NextResponse.json({
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

/**
 * PATCH /api/notifications
 * - Mark notifications as read
 * - Body: { notificationIds: string[], read: boolean }
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { notificationIds, read } = body;

        if (!Array.isArray(notificationIds) || typeof read !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        // Validate ObjectIds
        const validIds = notificationIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));

        if (validIds.length === 0) {
            return NextResponse.json({ error: 'No valid notification IDs provided' }, { status: 400 });
        }

        // Update notifications belonging to the user
        const result = await Notification.updateMany(
            {
                _id: { $in: validIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
                owner: session.user.id,
            },
            { $set: { read } }
        );

        return NextResponse.json({
            success: true,
            updated: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
}

/**
 * DELETE /api/notifications
 * - Delete a notification or all read notifications
 * - Query params: ?id=notificationId (delete one) or ?allRead=true (delete all read)
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const allRead = searchParams.get('allRead') === 'true';

        if (id) {
            // Delete single notification
            const result = await Notification.deleteOne({
                _id: new mongoose.Types.ObjectId(id),
                owner: session.user.id,
            });

            if (result.deletedCount === 0) {
                return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, message: 'Notification deleted' });
        } else if (allRead) {
            // Delete all read notifications
            const result = await Notification.deleteMany({
                owner: session.user.id,
                read: true,
            });

            return NextResponse.json({
                success: true,
                deleted: result.deletedCount,
                message: `Deleted ${result.deletedCount} read notification(s)`,
            });
        } else {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error deleting notifications:', error);
        return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
    }
}
