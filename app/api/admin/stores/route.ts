import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import Store from "@/models/store";
import User from "@/models/users";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get all stores with owner information
        const stores = await Store.find({})
            .populate('owner', 'username email _id')
            .lean();

        const storesWithOwner = stores.map((store: any) => ({
            _id: store._id,
            owner: store.owner ? {
                _id: store.owner._id,
                username: store.owner.username,
                email: store.owner.email,
            } : null,
            brandName: store.brandName,
            domain: store.domain,
            active: store.active || false,
            createdAt: store.createdAt,
            updatedAt: store.updatedAt,
        }));

        return NextResponse.json({ stores: storesWithOwner });
    } catch (error) {
        console.error('Admin get stores error:', error);
        return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
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
        const { storeId, active } = body;

        if (!storeId || typeof active !== 'boolean') {
            return NextResponse.json({ error: 'Store ID and active status required' }, { status: 400 });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        store.active = active;
        await store.save();

        return NextResponse.json({ message: 'Store updated successfully', store });
    } catch (error) {
        console.error('Admin update store error:', error);
        return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
    }
}

