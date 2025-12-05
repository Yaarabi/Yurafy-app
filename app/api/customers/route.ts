import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoDB";
import Order from "@/models/orders";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import type { Session } from "next-auth";

type CustomerStat = {
    customerId: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: { address?: string | null; city?: string | null; country?: string | null } | null;
    totalOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    lastOrderAt?: string | null;
    lastOrderStatus?: string | null; 
};

function parseNumberParam(value: string | null, fallback: number, min = 1, max = Infinity) {
    if (!value) return fallback;
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.max(min, Math.min(max, n));
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session: Session | null = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ownerId = session.user.id;
    // Ensure orders feature is allowed for this user (customers are derived from orders)
    const { ensureFeatureEnabled } = await import('@/lib/utils/planEnforcer');
    const featureCheck = await ensureFeatureEnabled(ownerId, 'orders');
    if (featureCheck) return featureCheck;
        const ownerObjectId = new Types.ObjectId(ownerId);

        const url = new URL(req.url);
        const page = parseNumberParam(url.searchParams.get("page"), 1, 1);
        const limit = parseNumberParam(url.searchParams.get("limit"), 50, 1, 200);
        const skip = (page - 1) * limit;

        const pipeline: any[] = [
        { $match: { owner: ownerObjectId } },
        // Sort by customerKey + latest createdAt
        {
            $sort: { "shippingAddress.phone": 1, createdAt: -1 }
        },
        {
            $project: {
            status: 1,
            totalAmount: 1,
            createdAt: 1,
            shippingAddress: 1,
            customerPhone: "$shippingAddress.phone",
            customerEmail: "$shippingAddress.email",
            customerFullName: "$shippingAddress.fullName",
            customerAddress: "$shippingAddress.address",
            customerCity: "$shippingAddress.city",
            customerCountry: "$shippingAddress.country",
            customerKey: {
                $cond: [
                { $and: [{ $ne: ["$shippingAddress.phone", null] }, { $ne: ["$shippingAddress.phone", ""] }] },
                "$shippingAddress.phone",
                {
                    $cond: [
                    { $and: [{ $ne: ["$shippingAddress.email", null] }, { $ne: ["$shippingAddress.email", ""] }] },
                    "$shippingAddress.email",
                    {
                        $concat: [
                        { $ifNull: ["$shippingAddress.fullName", "unknown"] },
                        "||",
                        { $ifNull: ["$shippingAddress.address", "noaddress"] },
                        ]
                    }
                    ]
                }
                ]
            }
            }
        },
        {
            $group: {
            _id: "$customerKey",
            phone: { $first: "$customerPhone" },
            email: { $first: "$customerEmail" },
            name: { $first: "$customerFullName" },
            addressObj: {
                $first: {
                address: "$customerAddress",
                city: "$customerCity",
                country: "$customerCountry"
                }
            },
            totalOrders: { $sum: 1 },
            deliveredOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
            cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
            totalSpent: { $sum: { $ifNull: ["$totalAmount", 0] } },
            lastOrderAt: { $first: "$createdAt" },      
            lastOrderStatus: { $first: "$status" }     
            }
        },
        {
            $project: {
            _id: 0,
            customerId: { $toString: "$_id" },
            name: 1,
            email: 1,
            phone: 1,
            address: "$addressObj",
            totalOrders: 1,
            deliveredOrders: 1,
            cancelledOrders: 1,
            totalSpent: 1,
            lastOrderAt: 1,
            lastOrderStatus: 1
            }
        },
        { $sort: { lastOrderAt: -1, totalOrders: -1 } },
        { $skip: skip },
        { $limit: limit }
        ];

        const data = (await Order.aggregate(pipeline)) as CustomerStat[];

        if (data.length === 0) {
        return NextResponse.json({ data: [], message: "No customers found" }, { status: 200 });
        }

        const countPipeline = [
        { $match: { owner: ownerObjectId } },
        {
            $project: {
            customerKey: {
                $cond: [
                { $and: [{ $ne: ["$shippingAddress.phone", null] }, { $ne: ["$shippingAddress.phone", ""] }] },
                "$shippingAddress.phone",
                {
                    $cond: [
                    { $and: [{ $ne: ["$shippingAddress.email", null] }, { $ne: ["$shippingAddress.email", ""] }] },
                    "$shippingAddress.email",
                    {
                        $concat: [
                        { $ifNull: ["$shippingAddress.fullName", "unknown"] },
                        "||",
                        { $ifNull: ["$shippingAddress.address", "noaddress"] },
                        ]
                    }
                    ]
                }
                ]
            }
            }
        },
        { $group: { _id: "$customerKey" } },
        { $count: "count" }
        ];

        const countRes = await Order.aggregate(countPipeline);
        const totalCustomers = countRes[0]?.count ?? 0;

        return NextResponse.json(
            {
                data,
                meta: {
                    page,
                    limit,
                    totalCustomers,
                    totalPages: Math.ceil(totalCustomers / limit)
                }
            },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                },
            }
        );
    } catch (err) {
        console.error("my-customers error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
