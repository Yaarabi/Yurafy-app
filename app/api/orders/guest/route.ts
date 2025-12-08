import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/store/orders";
import { normalizePhoneNumber } from "@/lib/whatsapp/phoneNormalize";

// POST Create Order (guest order - no authentication required)
export async function POST(req: Request) {
    await connectDB();

    try {
        const body = await req.json();

        if (!body.products || !body.shippingAddress || !body.owner) {
            return NextResponse.json({ error: "Missing required fields: products, shippingAddress, owner" }, { status: 400 });
        }

        // Validate products array
        if (!Array.isArray(body.products) || body.products.length === 0) {
            return NextResponse.json({ error: "Products array is required and must not be empty" }, { status: 400 });
        }

        // Validate shipping address
        if (!body.shippingAddress.fullName || !body.shippingAddress.phone || !body.shippingAddress.address) {
            return NextResponse.json({ error: "Shipping address must include fullName, phone, and address" }, { status: 400 });
        }

        // Normalize phone number to E.164 format
        const normalizedPhone = normalizePhoneNumber(body.shippingAddress.phone);

        // Ensure products have required fields
        const products = body.products.map((p: any) => ({
            product: p.product || undefined,
            name: p.name,
            quantity: p.quantity,
            price: p.price,
            color: p.color || undefined,
            size: p.size || undefined,
        }));

        // ✅ FIXED: Use transaction for atomic limit check + creation
        const mongoose = (await import('mongoose')).default;
        const mongoSession = await mongoose.startSession();
        
        let order: any;
        try {
            await mongoSession.withTransaction(async () => {
                const userId = body.owner;

                // Check plan limits WITHIN transaction to prevent race conditions
                const { canPerformAction } = await import('@/lib/utils/planLimits');
                const canCreate = await canPerformAction(userId, 'create_order', mongoSession);
                if (!canCreate.allowed) {
                    throw new Error(canCreate.reason || "Plan limit reached");
                }

                const orderDoc = new Order({
                    owner: body.owner,
                    products,
                    totalAmount: body.totalAmount,
                    shippingAddress: {
                        fullName: body.shippingAddress.fullName,
                        email: body.shippingAddress.email || undefined,
                        phone: normalizedPhone, // Use normalized phone number
                        address: body.shippingAddress.address,
                        city: body.shippingAddress.city || undefined,
                        country: body.shippingAddress.country || undefined,
                    },
                    deliveryInstructions: body.deliveryInstructions || undefined,
                    preferredTime: body.preferredTime || undefined,
                    status: "new",
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
                    error: error.message || "Plan limit reached" 
                }, { status: 403 });
            }
            throw error;
        } finally {
            await mongoSession.endSession();
        }

        if (!order) {
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // Send notification if limit reached (outside transaction)
        try {
            const { deactivateFeaturesOnLimitReached } = await import('@/lib/utils/planLimits');
            await deactivateFeaturesOnLimitReached(body.owner);
        } catch (error) {
            console.error('Error sending limit notification:', error);
            // Don't fail order creation if notification fails
        }

        // Trigger WhatsApp automation (async)
        fetch(`${process.env.NEXTAUTH_URL}/api/whatsapp/trigger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order })
        }).catch(err => console.error('Trigger API call failed:', err));

        return NextResponse.json({ 
            message: "Order created successfully", 
            order: {
                _id: order._id,
                owner: order.owner,
                products: order.products,
                totalAmount: order.totalAmount,
                status: order.status,
                shippingAddress: order.shippingAddress,
                createdAt: order.createdAt,
            }
        }, { status: 201 });
    } catch (err: any) {
        console.error("Guest order creation error:", err);

        if (err.name === "ValidationError") {
            const errors: Record<string, string> = {};
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
        }

        return NextResponse.json(
            { error: "Order creation failed", message: err.message || "Unknown error" },
            { status: 500 }
        );
    }
}

