import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import Notification from '@/models/support/notification';
import mongoose from 'mongoose';

/**
 * POST /api/notifications/create
 * - Create a notification (used by admin or system)
 * - Requires admin role OR userId in body for system notifications
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        await connectDB();

        const body = await req.json();
        const { ownerId, type, title, message, link, metadata } = body;

        // Validate required fields
        if (!ownerId || !type || !title || !message) {
            return NextResponse.json(
                { error: 'ownerId, type, title, and message are required' },
                { status: 400 }
            );
        }

        // Validate ownerId
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return NextResponse.json({ error: 'Invalid ownerId' }, { status: 400 });
        }

        // Only admin can create notifications for other users
        // System can create notifications without session (for scheduled tasks)
        if (session?.user?.id && session.user.role !== 'admin' && session.user.id !== ownerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate type
        const validTypes = ['support_reply', 'order_update', 'plan_expiry', 'plan_warning', 'plan_limit_reached', 'plan_subscription', 'welcome', 'system', 'admin_message', 'agent'];
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
        }

        // Create notification
        const notification = await Notification.create({
            owner: new mongoose.Types.ObjectId(ownerId),
            type,
            title,
            message,
            link,
            metadata,
            read: false,
        });

        return NextResponse.json({
            success: true,
            notification,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}

