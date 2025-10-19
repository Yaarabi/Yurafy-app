import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";
import Order, { IOrder } from "@/models/orders";
import { connectDB } from "@/lib/db/mongoDB";

/**
 * 🔍 Search orders by name, phone, ID, or status
 */
export const searchOrderTool = tool(
    async ({ ownerId, query }) => {
        await connectDB();

        const filters: any[] = [
        { "shippingAddress.fullName": new RegExp(query, "i") },
        { "shippingAddress.phone": new RegExp(query, "i") },
        { status: new RegExp(query, "i") },
        ];

        // Add ObjectId match if valid
        if (/^[0-9a-fA-F]{24}$/.test(query)) {
        filters.push({ _id: new mongoose.Types.ObjectId(query) });
        }

        // ✅ Use generic typing for clean result type
        const orders = await Order.find<IOrder>({
        owner: new mongoose.Types.ObjectId(ownerId),
        $or: filters,
        })
        .limit(5)
        .lean<IOrder[]>(); // <— clean type inference

        if (!orders.length) return "No orders found matching that query.";

        return orders.map((o) => ({
        id: o._id?.toString(),
        customer: o.shippingAddress?.fullName,
        phone: o.shippingAddress?.phone,
        total: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
        }));
    },
    {
        name: "search_order",
        description:
        "Search for customer orders by name, phone number, order ID, or status.",
        schema: z.object({
        ownerId: z.string().describe("The ID of the business owner"),
        query: z.string().describe(
            "Search term (name, phone, status, or order ID)"
        ),
        }),
    }
);


/**
 * 🚚 Update order status
 */
export const updateOrderStatusTool = tool(
    async ({ ownerId, orderId, newStatus }) => {
        await connectDB();

        const order = (await Order.findOneAndUpdate(
        { _id: orderId, owner: ownerId },
        { status: newStatus },
        { new: true }
        ).lean()) as IOrder | null;

        if (!order) return "Order not found.";

        return `✅ Order ${order._id} status updated to "${order.status}".`;
    },
    {
        name: "update_order_status",
        description:
        "Update the status of an existing order (e.g., confirmed, shipped, delivered).",
        schema: z.object({
        ownerId: z.string().describe("The ID of the business owner"),
        orderId: z.string().describe("The order ID to update"),
        newStatus: z.enum([
            "new",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
        ]),
        }),
    }
);

/**
 * 🆕 Create new order
 */
export const createOrderTool = tool(
    async ({ ownerId, customer, products, totalAmount }) => {
        await connectDB();

        if (!products?.length) return "Cannot create order: product list is empty.";

        const order = await Order.create({
        owner: ownerId,
        products,
        totalAmount,
        shippingAddress: customer,
        });

        return `🆕 New order created for ${customer.fullName} (total: ${totalAmount}). Order ID: ${order._id}`;
    },
    {
        name: "create_order",
        description: "Create a new order for a customer.",
        schema: z.object({
        ownerId: z.string().describe("The ID of the business owner"),
        customer: z.object({
            fullName: z.string(),
            phone: z.string(),
            address: z.string(),
            city: z.string().optional(),
            country: z.string().optional(),
        }),
        products: z.array(
            z.object({
            name: z.string(),
            quantity: z.number(),
            price: z.number(),
            color: z.string().optional(),
            size: z.string().optional(),
            })
        ),
        totalAmount: z.number().describe("The total price of the order"),
        }),
    }
);

export const orderTools = [
    searchOrderTool,
    updateOrderStatusTool,
    createOrderTool,
];
