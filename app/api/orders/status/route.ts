import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/store/orders";

const VALID_STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = typeof VALID_STATUSES[number];

// ✅ PATCH Update Order Status only
export async function PATCH(req: Request) {
    await connectDB();
    
    try {
        const body = await req.json();
        const { id, status, ownerId: bodyOwnerId } = body;

        // Determine userId from session or body (for internal API calls)
        let userId: string | undefined;
        
        if (bodyOwnerId) {
            // Internal call with ownerId (from btns-handler, triggers, etc.)
            userId = bodyOwnerId;
        } else {
            // External call - require session
            const session = await getServerSession(authOptions);
            if (!session || !session.user?.id) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }
            userId = session.user.id;
            
            // Ensure orders feature is allowed for this user (only for session-based calls)
            const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
            const check = await ensureFeatureEnabled(userId, 'orders');
            if (check) return check;
        }

        if (!id) {
            return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
        }

        if (!status) {
            return NextResponse.json({ message: "Status is required" }, { status: 400 });
        }

        // Validate status value
        if (!VALID_STATUSES.includes(status as OrderStatus)) {
            return NextResponse.json({ 
                message: `Invalid status. Valid values: ${VALID_STATUSES.join(", ")}` 
            }, { status: 400 });
        }

        const order = await Order.findOneAndUpdate(
            { _id: id, owner: userId },
            { status },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        // Trigger Google Sheets integration if connected (non-blocking)
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            fetch(`${baseUrl}/api/integrations/google-sheets/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: id,
                    ownerId: userId,
                }),
            }).catch(err => console.error('Google Sheets send error:', err));
        } catch (err) {
            // Silently fail - don't block order status update
            console.error('Error triggering Google Sheets:', err);
        }

        return NextResponse.json({ 
            message: "Order status updated", 
            order: {
                _id: order._id,
                status: order.status,
                customerName: order.shippingAddress?.fullName,
                updatedAt: order.updatedAt
            }
        });
    } catch (error: any) {
        console.error("Order status update error:", error);
        return NextResponse.json({ 
            message: "Error updating order status", 
            error: error.message 
        }, { status: 500 });
    }
}
