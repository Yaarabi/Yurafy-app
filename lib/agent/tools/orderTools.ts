import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";
import Order, { IOrder } from "@/models/orders";
import Notification from "@/models/notification";
import { connectDB } from "@/lib/db/mongoDB";
import type { IWhatsAppConversation } from "@/models/whatsappMessage";

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

        // Return as formatted string for Mistral AI compatibility
        const orderList = orders.map((o) => {
            const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A';
            return `• Order #${o._id?.toString()} - ${o.shippingAddress?.fullName} (${o.shippingAddress?.phone}) - Total: ${o.totalAmount} - Status: ${o.status} - Date: ${date}`;
        }).join('\n');
        
        return `Found ${orders.length} order(s):\n${orderList}`;
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

        // Create notification for agent action
        await Notification.create({
            owner: ownerId,
            type: 'agent',
            title: 'AI Agent Updated Order',
            message: `Order #${order._id} status changed to "${order.status}" for customer ${order.shippingAddress?.fullName || 'Unknown'}.`,
            link: `/dashboard/orders?id=${order._id}`,
            metadata: { orderId: order._id, action: 'update_status', newStatus: order.status },
        });

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

        // Create notification for agent action
        await Notification.create({
            owner: ownerId,
            type: 'agent',
            title: 'AI Agent Created Order',
            message: `New order created for ${customer.fullName} (${customer.phone}) with total ${totalAmount}.`,
            link: `/dashboard/orders?id=${order._id}`,
            metadata: { orderId: order._id, action: 'create_order', customerName: customer.fullName },
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

/**
 * 📦 Extract orders from messages - processes conversation messages to detect order information
 * This tool analyzes messages from customers to identify order requests and automatically creates orders
 */
export const extractOrdersFromMessagesTool = tool(
    async ({ ownerId, customerPhone, messageIds, startDate, endDate }) => {
        await connectDB();
        
        try {
            // Import WhatsAppConversation model with proper typing
            const { default: WhatsAppConversation } = await import("@/models/whatsappMessage");
            
            // Find the conversation (lean to plain object)
            const conversation = await (WhatsAppConversation as mongoose.Model<IWhatsAppConversation>).findOne({
                owner: new mongoose.Types.ObjectId(ownerId),
                'customer.phone': customerPhone
            }).lean<IWhatsAppConversation>();

            if (!conversation) {
                return `❌ No conversation found for ${customerPhone}.`;
            }

            // Filter messages by criteria
            let messages = conversation.messages || [];
            
            // Filter by specific message IDs if provided
            if (messageIds && messageIds.length > 0) {
                messages = messages.filter((msg: any) => messageIds.includes(msg.waMessageId || msg.timestamp?.toString()));
            }
            
            // Filter by date range if provided
            if (startDate || endDate) {
                const start = startDate ? new Date(startDate).getTime() : 0;
                const end = endDate ? new Date(endDate).getTime() : Date.now();
                messages = messages.filter((msg: any) => {
                    const msgTime = msg.timestamp;
                    return msgTime >= start && msgTime <= end;
                });
            }

            // Filter only incoming messages (from customer)
            messages = messages.filter((msg: any) => msg.direction === 'incoming' && msg.text);

            if (messages.length === 0) {
                return `❌ No messages found matching the criteria for ${customerPhone}.`;
            }

            // Prepare messages for analysis
            const messageTexts = messages.map((msg: any, idx: number) => {
                const time = new Date(msg.timestamp).toLocaleString();
                return `[${idx + 1}] ${time}: ${msg.text}`;
            }).join('\n');

            const analysisPrompt = `Analyze the following messages from customer ${customerPhone} and identify if they contain order requests. Look for:
- Product names or descriptions
- Quantities
- Addresses for delivery
- Customer details (name, phone)
- Any indication they want to place an order

Messages:
${messageTexts}

If you find order information, extract:
1. Customer full name
2. Phone number (use ${customerPhone} if not mentioned)
3. Delivery address
4. Products with names, quantities, and prices (estimate if needed)
5. Total amount

Respond ONLY with JSON format if an order is detected:
{
    "orderDetected": true,
    "customer": { "fullName": "...", "phone": "...", "address": "...", "city": "...", "country": "..." },
    "products": [{ "name": "...", "quantity": 1, "price": 0 }],
    "totalAmount": 0,
    "notes": "Additional context..."
}

If no clear order intent, respond with: {"orderDetected": false, "reason": "..."}`;

            // Use AI to analyze messages
            const { ChatMistralAI } = await import("@langchain/mistralai");
            const aiModel = new ChatMistralAI({
                model: "mistral-large-latest",
                apiKey: process.env.MISTRAL_API_KEY,
                temperature: 0.3,
            });

            const response = await aiModel.invoke(analysisPrompt);
            const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
            
            // Parse AI response
            let analysis;
            try {
                // Extract JSON from markdown code blocks if present
                const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
                const jsonStr = jsonMatch ? jsonMatch[1] : content;
                analysis = JSON.parse(jsonStr);
            } catch (e) {
                return `❌ Failed to parse order information from messages. AI response: ${content}`;
            }

            if (!analysis.orderDetected) {
                return `ℹ️ No clear order request detected in the selected messages. Reason: ${analysis.reason || 'No order intent found'}`;
            }

            // Create the order
            const order = await Order.create({
                owner: ownerId,
                products: analysis.products,
                totalAmount: analysis.totalAmount,
                shippingAddress: analysis.customer,
                status: 'new',
            });

            // Create notification
            await Notification.create({
                owner: ownerId,
                type: 'agent',
                title: 'AI Agent Extracted Order from Messages',
                message: `Order created from conversation with ${analysis.customer.fullName} (${customerPhone}). Total: ${analysis.totalAmount}`,
                link: `/dashboard/orders`,
                metadata: { 
                    orderId: order._id, 
                    action: 'extract_order', 
                    customerPhone,
                    messagesAnalyzed: messages.length,
                    notes: analysis.notes
                },
            });

            return `✅ Order extracted and created! Order ID: ${order._id}
Customer: ${analysis.customer.fullName}
Products: ${analysis.products.length} item(s)
Total: ${analysis.totalAmount}
${analysis.notes ? `Notes: ${analysis.notes}` : ''}
Messages analyzed: ${messages.length}`;

        } catch (error: any) {
            console.error('Extract orders from messages error:', error);
            return `❌ Error processing messages: ${error.message}`;
        }
    },
    {
        name: "extract_orders_from_messages",
        description: "Analyze customer conversation messages to detect and extract order information, then automatically create orders. Can filter by specific message IDs or date range. Useful for bulk processing of order requests from WhatsApp messages.",
        schema: z.object({
            ownerId: z.string().describe("The ID of the business owner"),
            customerPhone: z.string().describe("The customer's phone number"),
            messageIds: z.array(z.string()).optional().describe("Specific message IDs to analyze (optional)"),
            startDate: z.string().optional().describe("Start date filter in ISO format (optional)"),
            endDate: z.string().optional().describe("End date filter in ISO format (optional)"),
        }),
    }
);

export const orderTools = [
    searchOrderTool,
    updateOrderStatusTool,
    createOrderTool,
    extractOrdersFromMessagesTool,
];
