import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";

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

        // Ensure products have required fields
        const products = body.products.map((p: any) => ({
            product: p.product || undefined,
            name: p.name,
            quantity: p.quantity,
            price: p.price,
            color: p.color || undefined,
            size: p.size || undefined,
        }));

        const order = new Order({
            owner: body.owner,
            products,
            totalAmount: body.totalAmount,
            shippingAddress: {
                fullName: body.shippingAddress.fullName,
                email: body.shippingAddress.email || undefined,
                phone: body.shippingAddress.phone,
                address: body.shippingAddress.address,
                city: body.shippingAddress.city || undefined,
                country: body.shippingAddress.country || undefined,
            },
            deliveryInstructions: body.deliveryInstructions || undefined,
            preferredTime: body.preferredTime || undefined,
            status: "new",
        });

        await order.save();

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

