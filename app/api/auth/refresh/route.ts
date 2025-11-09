import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import Plan from "@/models/plan";

export async function POST(req: NextRequest) {
    await connectDB();

    const body = await req.json();
    const userId = body?.id;

    if (!userId) {
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let activePlan = "free";
    if (user.currentPlanId) {
        const plan = await Plan.findById(user.currentPlanId);
        if (plan?.status === "active") {
        activePlan = plan.planKey;
        }
    }

    return NextResponse.json({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        logo: user.logo || '',
        role: user.role,
        plan: activePlan,
        onboardingCompleted: user.onboardingCompleted || false,
        active: user.active || false,
        emailVerified: user.emailVerified || false,
    });
}
