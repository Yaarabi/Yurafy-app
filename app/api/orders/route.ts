import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";

// ✅ GET Orders (all or by id, but scoped to logged-in user)
export async function GET(req: Request) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // 👈 get owner from session
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
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    try {
        const body = await req.json();

        if (!body.products || !body.shippingAddress) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const order = new Order({
        ...body,
        owner: userId, 
        });
        await order.save();

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
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const detail = await req.json();

    if (!id) return NextResponse.json({ message: "Order ID is required" }, { status: 400 });

    try {
        const result = await Order.findOneAndUpdate(
        { _id: id, owner: userId }, // 👈 scoped to user
        detail,
        { new: true }
        );
        if (!result) return NextResponse.json({ message: "Order not found" }, { status: 404 });

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
