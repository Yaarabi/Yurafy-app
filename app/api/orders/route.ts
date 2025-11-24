import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import Order, { IOrder } from "@/models/orders";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";
import mongoose from "mongoose";

// ✅ GET Orders (all or by id, but scoped to logged-in user)
export async function GET(req: Request) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // 👈 get owner from session
    // Ensure orders feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(userId, 'orders');
    if (check) return check;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    try {
        if (id) {
        const order = await Order.findOne({ _id: id, owner: userId });
        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Order retrieved", order });
        }

        // Return all orders for this user
        const orders = await Order.find({ owner: userId });
        return NextResponse.json({ message: "User orders retrieved", orders });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

// ✅ POST Create Order (owner comes from session)
export async function POST(req: Request) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    // Ensure orders feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(userId, 'orders');
    if (check) return check;
    try {
        const body = await req.json();

        if (!body.products || !body.shippingAddress) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Normalize phone number in shipping address to E.164 format
        if (body.shippingAddress?.phone) {
            body.shippingAddress.phone = normalizePhoneNumber(body.shippingAddress.phone);
        }

        // ✅ FIXED: Use transaction for atomic limit check + creation
        const mongoose = (await import('mongoose')).default;
        const mongoSession = await mongoose.startSession();
        
        let order: IOrder | undefined;
        try {
            await mongoSession.withTransaction(async () => {
                // Check plan limits WITHIN transaction to prevent race conditions
                const { canPerformAction } = await import('@/lib/utils/planLimits');
                const canCreate = await canPerformAction(userId, 'create_order', mongoSession);
                if (!canCreate.allowed) {
                    throw new Error(canCreate.reason || "Plan limit reached");
                }

                // Create order within transaction
                const orderDoc = new Order({
                    ...body,
                    owner: userId, 
                });
                const savedOrder = await orderDoc.save({ session: mongoSession });
                order = savedOrder.toObject();

                // Verify limit not exceeded after creation (within same transaction)
                const { checkPlanLimit } = await import('@/lib/utils/planLimits');
                const afterCheck = await checkPlanLimit(userId, 'orders', mongoSession);
                
                if (afterCheck.hasReachedLimit && afterCheck.limit !== null) {
                    // Orders can't be deleted, but we prevent creation if limit reached
                    // This check happens before creation, so if we're here, limit was just reached
                }
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

        if (!order) {
            return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
        }

        // Send notification if limit reached (outside transaction)
        try {
            const { deactivateFeaturesOnLimitReached } = await import('@/lib/utils/planLimits');
            await deactivateFeaturesOnLimitReached(userId);
        } catch (error) {
            console.error('Error sending limit notification:', error);
            // Don't fail order creation if notification fails
        }

        // WhatsApp trigger will be handled in the frontend after order creation

        return NextResponse.json({ message: "Order created successfully", order }, { status: 201 });
    } catch (err: any) {
        console.error("Order creation error:", err);

        if (err.name === "ValidationError") {
        const errors: Record<string, string> = {};
        Object.keys(err.errors).forEach((key) => {
            errors[key] = err.errors[key].message;
        });
        return NextResponse.json({ message: "Validation failed", errors }, { status: 400 });
        }

        return NextResponse.json(
        { message: "Order creation failed", error: err.message || "Unknown error" },
        { status: 500 }
        );
    }
}

// ✅ PUT Update Order (only if owned by user)
export async function PUT(req: Request) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    // Ensure orders feature is allowed for this user
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const check = await ensureFeatureEnabled(userId, 'orders');
    if (check) return check;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const detail = await req.json();

    if (!id) return NextResponse.json({ message: "Order ID is required" }, { status: 400 });

    // Normalize phone number in shipping address if provided
    if (detail.shippingAddress?.phone) {
        detail.shippingAddress.phone = normalizePhoneNumber(detail.shippingAddress.phone);
    }

    try {
        const result = await Order.findOneAndUpdate(
        { _id: id, owner: userId }, // 👈 scoped to user
        detail,
        { new: true }
        );
        if (!result) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        // WhatsApp trigger will be handled in the frontend after order update

        return NextResponse.json({ message: "Order updated", order: result });
    } catch (error) {
        return NextResponse.json({ message: "Error in PUT request", error }, { status: 500 });
    }
}

// ✅ DELETE Order (only if owned by user)
export async function DELETE(req: Request) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "Order ID is required" }, { status: 400 });

    try {
        const result = await Order.findOneAndDelete({ _id: id, owner: userId }); // 👈 scoped to user
        if (!result) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        return NextResponse.json({ message: "Order deleted", data: result }, { status: 202 });
    } catch (error) {
        return NextResponse.json({ message: "Error in DELETE request", error }, { status: 500 });
    }
}
