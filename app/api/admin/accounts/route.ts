import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/automation/whatsappAccount";
import User from "@/models/users";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get all WhatsApp accounts with owner information
        const accounts = await WhatsAppAccount.find({})
            .populate('owner', 'username email _id')
            .lean();

        const accountsWithOwner = accounts.map((account: any) => ({
            _id: account._id,
            owner: account.owner ? {
                _id: account.owner._id,
                username: account.owner.username,
                email: account.owner.email,
            } : null,
            waNumber: account.waNumber,
            status: account.status,
            verified: account.verified || false,
            active: account.active || false,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        }));

        return NextResponse.json({ accounts: accountsWithOwner });
    } catch (error) {
        console.error('Admin get accounts error:', error);
        return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { accountId, active } = body;

        if (!accountId || typeof active !== 'boolean') {
            return NextResponse.json({ error: 'Account ID and active status required' }, { status: 400 });
        }

        const account = await WhatsAppAccount.findById(accountId);
        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        account.active = active;
        await account.save();

        return NextResponse.json({ message: 'Account updated successfully', account });
    } catch (error) {
        console.error('Admin update account error:', error);
        return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
    }
}

