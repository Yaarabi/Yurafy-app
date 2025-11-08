import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import User, { IUser } from '@/models/users';
import WhatsAppAccount from '@/models/whatsappAccount';
import WhatsAppConversation from '@/models/whatsappMessage';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        // If userId is provided, return stats for that specific user
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
            }

            const user = await User.findById(userId);
            if (!user || user.role === 'admin') {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const stats = await getUserStats(userId);
            return NextResponse.json({ [userId]: stats });
        }

        // Otherwise, return stats for all users (excluding admins)
        const users = await User.find({ role: { $ne: 'admin' } }).select('_id');
        
        const userStats = await Promise.all(
            users.map(async (user) => {
                const stats = await getUserStats(user._id.toString());
                return {
                    userId: user._id.toString(),
                    ...stats,
                };
            })
        );

        return NextResponse.json({ stats: userStats });
    } catch (err) {
        console.error('Admin user stats error:', err);
        return NextResponse.json({ error: 'Failed to fetch user statistics' }, { status: 500 });
    }
}

async function getUserStats(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Count WhatsApp accounts
    const whatsappAccountsCount = await WhatsAppAccount.countDocuments({ owner: userObjectId });

    // Get all conversations for this user
    const conversations = await WhatsAppConversation.find({ owner: userObjectId }).lean();

    // Count unique contacts (unique phone numbers in conversations)
    const uniqueContacts = new Set<string>();
    conversations.forEach((conv) => {
        if (conv.customer?.phone) {
            uniqueContacts.add(conv.customer.phone);
        }
    });
    const contactsCount = uniqueContacts.size;

    // Count total messages (sum of messages array length in all conversations)
    const messagesCount = conversations.reduce((total, conv) => {
        return total + (conv.messages?.length || 0);
    }, 0);

    // Get tokens consumed from user model (default to 0)
    const user = await User.findById(userId).select('tokensConsumed').lean() as unknown as Pick<IUser, 'tokensConsumed'> | null;
    const tokensConsumed = user?.tokensConsumed || 0;

    return {
        whatsappAccounts: whatsappAccountsCount,
        contacts: contactsCount,
        messages: messagesCount,
        tokensConsumed: tokensConsumed,
    };
}

