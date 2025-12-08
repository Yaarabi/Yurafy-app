import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; 
import { authOptions } from "@/lib/auth/auth"; 
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/store/orders";
import { IOrder } from "@/models/store/orders";

export async function POST(req: NextRequest) {
    await connectDB();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const ordersFromCSV: Partial<IOrder>[] = body.orders;

        if (!Array.isArray(ordersFromCSV) || ordersFromCSV.length === 0) {
        return NextResponse.json({ message: "No orders provided" }, { status: 400 });
        }

        const userId = session.user.id;

        // ✅ FIXED: Use transaction for atomic limit check + creation
        const mongoose = (await import('mongoose')).default;
        const mongoSession = await mongoose.startSession();
        
        let insertedOrders: any[] = [];

        try {
            await mongoSession.withTransaction(async () => {
                // Check plan limits
                const { checkPlanLimit, canPerformAction } = await import('@/lib/utils/planLimits');
                
                // First check if feature is enabled
                const canCreate = await canPerformAction(userId, 'create_order', mongoSession);
                if (!canCreate.allowed) {
                    throw new Error(canCreate.reason || "Plan limit reached");
                }

                // Check if bulk import fits within limit
                const limitCheck = await checkPlanLimit(userId, 'orders', mongoSession);
                if (limitCheck.limit !== null) {
                    if (limitCheck.currentUsage + ordersFromCSV.length > limitCheck.limit) {
                         throw new Error(`Importing ${ordersFromCSV.length} orders would exceed your plan limit of ${limitCheck.limit}. You have ${limitCheck.limit - limitCheck.currentUsage} remaining.`);
                    }
                }

                // Validate and attach owner
                const preparedOrders: Partial<IOrder>[] = ordersFromCSV.map((order) => ({
                    ...order,
                    owner: userId, // force owner from session
                    status: order.status || "new",
                    createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
                    updatedAt: new Date(),
                    products: order.products?.map((p) => ({
                        product: p.product,
                        name: p.name || "Unnamed product",
                        quantity: Number(p.quantity),
                        price: Number(p.price),
                        color: p.color,
                        size: p.size,
                    })) || [],
                }));

                insertedOrders = await Order.insertMany(preparedOrders, { session: mongoSession });
            });
        } catch (error: any) {
            await mongoSession.endSession();
            if (error.message?.includes('limit') || error.message?.includes('plan')) {
                return NextResponse.json({ 
                    message: error.message || "Plan limit reached" 
                }, { status: 403 });
            }
            throw error;
        } finally {
            await mongoSession.endSession();
        }

        // Trigger WhatsApp automation for each order (async)
        if (insertedOrders.length > 0) {
            insertedOrders.forEach(order => {
                 fetch(`${process.env.NEXTAUTH_URL}/api/whatsapp/trigger`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order })
                }).catch(err => console.error('Trigger API call failed:', err));
            });
        }

        return NextResponse.json({ message: "Orders imported successfully", orders: insertedOrders }, { status: 201 });

    } catch (err: any) {
        console.error("CSV Import Error:", err);
        return NextResponse.json({ message: "Failed to import orders", error: err.message || "Unknown error" }, { status: 500 });
    }
}
