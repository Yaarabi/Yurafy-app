import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import User from '@/models/users';
import Store from '@/models/store';
import Order from '@/models/orders';
import WhatsAppAccount from '@/models/whatsappAccount';
import SupportMessage from '@/models/support';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const [usersCount, storesCount, ordersCount, waAccountsCount, supportCount] = await Promise.all([
            User.countDocuments({}),
            Store.countDocuments({}),
            Order.countDocuments({}),
            WhatsAppAccount.countDocuments({}),
            SupportMessage.countDocuments({}),
        ]);

        const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5).select('username email createdAt');
        const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).select('customerName total status createdAt');

        return NextResponse.json({
            counts: { users: usersCount, stores: storesCount, orders: ordersCount, whatsappAccounts: waAccountsCount, supportMessages: supportCount },
            recent: { users: recentUsers, orders: recentOrders },
        });
    } catch (err) {
        console.error('Admin overview error:', err);
        return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 });
    }
}


