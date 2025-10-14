import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; 
import { authOptions } from "@/lib/auth/auth"; 
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";
import { IOrder } from "@/models/orders";

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

        // Validate and attach owner
        const preparedOrders: Partial<IOrder>[] = ordersFromCSV.map((order) => ({
        ...order,
        owner: session.user.id, // force owner from session
        status: order.status || "new",
        createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
        updatedAt: new Date(),
        products: order.products?.map((p) => ({
            product: p.product,
            quantity: Number(p.quantity),
            price: Number(p.price),
            color: p.color,
            size: p.size,
        })) || [],
        }));

        const insertedOrders = await Order.insertMany(preparedOrders);

        return NextResponse.json({ message: "Orders imported successfully", orders: insertedOrders }, { status: 201 });

    } catch (err: any) {
        console.error("CSV Import Error:", err);
        return NextResponse.json({ message: "Failed to import orders", error: err.message || "Unknown error" }, { status: 500 });
    }
}
