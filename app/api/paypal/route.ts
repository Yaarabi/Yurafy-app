import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import Plan from "@/models/plan";

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

        const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
        const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
        const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // switch to live later

        // Get PayPal access token
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
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
                { status: 500 }
            );
        }

        // Verify order
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

        // Find user
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { verified: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Find user's current plan
        const existingPlan = await Plan.findById(user.currentPlanId);
        if (!existingPlan) {
            return NextResponse.json(
                { verified: false, error: "No existing plan found for user" },
                { status: 404 }
            );
        }

        // Update the existing plan details
        const durationDays = 30;
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + durationDays);

        existingPlan.planKey = plan;
        existingPlan.price = orderData.purchase_units?.[0]?.amount?.value || 0;
        existingPlan.durationDays = durationDays;
        existingPlan.startDate = startDate;
        existingPlan.endDate = endDate;
        existingPlan.status = "active";
        await existingPlan.save();

        // Update user flags
        user.active = true;
        user.onboardingCompleted = true;
        await user.save();

        return NextResponse.json({ verified: true });
    } catch (err) {
        console.error("PayPal verify error:", err);
        return NextResponse.json(
            { verified: false, error: "Server error" },
            { status: 500 }
        );
    }
}
