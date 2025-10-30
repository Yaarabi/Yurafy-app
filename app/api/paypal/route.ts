// app/api/paypal/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";

export async function POST(req: Request) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
        return NextResponse.json(
            { verified: false, error: "Unauthorized" },
            { status: 401 }
        );
        }

        const { orderId, plan } = await req.json();
        if (!orderId || !plan) {
        return NextResponse.json(
            { verified: false, error: "Missing order or plan" },
            { status: 400 }
        );
        }

        // ✅ Determine environment
        // const isSandbox = process.env.NEXT_PUBLIC_PAYPAL_ID?.startsWith("sb-") ?? true;
        // console.log(isSandbox)
        const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
        const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
        // const PAYPAL_API = isSandbox
        // ? "https://api-m.sandbox.paypal.com"
        // : "https://api-m.paypal.com";

        const PAYPAL_API = "https://api-m.sandbox.paypal.com"

        // ✅ Get access token
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(
        "base64"
        );

        const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        if (!accessToken) {
        return NextResponse.json(
            { verified: false, error: "Failed to get PayPal access token" },
            { status: 404 }
        );
        }

        // ✅ Verify order
        const verifyRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        });

        const orderData = await verifyRes.json();
        if (orderData.status !== "COMPLETED") {
        return NextResponse.json(
            { verified: false, error: "Order not completed" },
            { status: 400 }
        );
        }

        // ✅ Update user in DB
        const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: { active: true, plan } },
        { new: true }
        );

        if (!updatedUser) {
        return NextResponse.json(
            { verified: false, error: "User not found" },
            { status: 404 }
        );
        }

        return NextResponse.json({ verified: true });
    } catch (err) {
        console.error("Verify error:", err);
        return NextResponse.json(
        { verified: false, error: "Server error" },
        { status: 500 }
        );
    }
}
