import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Notification from "@/models/support/notification";
import SupportMessage from "@/models/support/support";
import ServiceInquiry from "@/models/support/serviceInquiry";
import SupportAgent from "@/models/support/supportAgent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

/**
 * GET: Fetch admin notifications
 * Includes: new support messages, service inquiries, and agent notes
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id || session.user.role !== 'admin') {
            console.log('Unauthorized access attempt:', { userId: session?.user?.id, role: session?.user?.role });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get all admin notifications
        const notifications = [];

        // 1. Check for new support messages (from users)
        try {
            const recentSupportMessages = await SupportMessage.find({ role: 'user' })
                .populate('owner', 'username email')
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            for (const msg of recentSupportMessages) {
                notifications.push({
                    _id: `support_${msg._id}`,
                    type: 'support_message',
                    title: 'New Support Message',
                    message: msg.text.substring(0, 150) + (msg.text.length > 150 ? '...' : ''),
                    metadata: {
                        userId: msg.owner?._id,
                        userName: msg.owner?.username,
                        userEmail: msg.owner?.email,
                    },
                    link: '/admin?tab=support',
                    read: false,
                    createdAt: msg.createdAt,
                });
            }
        } catch (error) {
            console.error('Error fetching support messages:', error);
        }

        // 2. Check for new service inquiries
        try {
            const recentInquiries = await ServiceInquiry.find({ status: 'new' })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            for (const inquiry of recentInquiries) {
                notifications.push({
                    _id: `service_${inquiry._id}`,
                    type: 'service_inquiry',
                    title: 'New Service Inquiry',
                    message: `${inquiry.fullName} requested ${inquiry.serviceType}`,
                    metadata: {
                        userName: inquiry.fullName,
                        userEmail: inquiry.email,
                        serviceType: inquiry.serviceType,
                        status: inquiry.status,
                    },
                    link: '/admin?tab=services',
                    read: false,
                    createdAt: inquiry.createdAt,
                });
            }
        } catch (error) {
            console.error('Error fetching service inquiries:', error);
        }

        // 3. Check for new agent notes
        try {
            const supportAgent = await SupportAgent.findOne().lean() as any;
            if (supportAgent?.notes && Array.isArray(supportAgent.notes)) {
                const recentNotes = supportAgent.notes
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 20);

                for (const note of recentNotes) {
                    notifications.push({
                        _id: `agent_${note._id}`,
                        type: 'agent_note',
                        title: 'New Agent Note',
                        message: note.note.substring(0, 150) + (note.note.length > 150 ? '...' : ''),
                        metadata: {
                            userName: note.guestName || 'Guest',
                            userEmail: note.contact,
                        },
                        link: '/admin?tab=support-agent',
                        read: false,
                        createdAt: note.createdAt,
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching agent notes:', error);
        }

        // Sort all notifications by date
        notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ 
            notifications,
            total: notifications.length 
        });
    } catch (error: any) {
        console.error('Error fetching admin notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}
