
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";

// ✅ GET Orders (all, by id, or by user)
export async function GET(req: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const user = searchParams.get("user");

        if (id) {
        const order = await Order.findById(id).populate("user").populate("products.product");
        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Order retrieved", order });
        }

        if (user) {
        const orders = await Order.find({ user }).populate("products.product");
        if (orders.length === 0) {
            return NextResponse.json({ message: "No orders found for this user" }, { status: 404 });
        }
        return NextResponse.json({ message: "User orders retrieved", orders });
        }

        const orders = await Order.find().populate("user").populate("products.product");
        return NextResponse.json({ message: "All orders retrieved", orders });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

// ✅ POST Create Order
export async function POST(req: Request) {
    await connectDB();
    try {
        const body = await req.json();
        const order = new Order(body);
        await order.save();
        return NextResponse.json(
        { message: "Order created successfully", order },
        { status: 201 }
        );
    } catch (error) {
        return NextResponse.json({ message: "Order creation failed", error }, { status: 500 });
    }
}

// ✅ PUT Update Order
export async function PUT(req: Request) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const detail = await req.json();

        if (!id) return NextResponse.json({ message: "Order ID is required" }, { status: 400 });

        const result = await Order.findByIdAndUpdate(id, detail, { new: true });
        if (!result) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        return NextResponse.json({ message: "Order updated", order: result });
    } catch (error) {
        return NextResponse.json({ message: "Error in PUT request", error }, { status: 500 });
    }
}

// ✅ DELETE Order
export async function DELETE(req: Request) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "Order ID is required" }, { status: 400 });

        const result = await Order.findByIdAndDelete(id);
        if (!result) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        return NextResponse.json({ message: "Order deleted", data: result }, { status: 202 });
    } catch (error) {
        return NextResponse.json({ message: "Error in DELETE request", error }, { status: 500 });
    }
}
