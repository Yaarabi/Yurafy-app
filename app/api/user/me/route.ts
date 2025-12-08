import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import Plan from "@/models/support/plan";

const ALLOWED_UPDATE_FIELDS = ["username", "email", "phone"];

const isValidObjectId = (id: string) => {
    const mongoose = require("mongoose");
    return mongoose.Types.ObjectId.isValid(id);
};

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(session.user.id).select("-password");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let planKey = "free";
        if (user.currentPlanId) {
            const plan = await Plan.findById(user.currentPlanId);
            if (plan && plan.status === "active") {
                planKey = plan.planKey;
            }
        }

        return NextResponse.json({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            phone: user.phone || '',

            role: user.role,
            plan: planKey,
            onboardingCompleted: user.onboardingCompleted || false,
            active: user.active || false,
            emailVerified: user.emailVerified || false,
        });
    } catch (error) {
        console.error("GET /api/user/me error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const updateData: Record<string, any> = {};

        // Only allow updating specific fields
        for (const field of ALLOWED_UPDATE_FIELDS) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        // Handle special case where field is 'name' but should be 'username'
        if (body.name !== undefined) {
            updateData.username = body.name;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            updateData,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let planKey = "free";
        if (updatedUser.currentPlanId) {
            const plan = await Plan.findById(updatedUser.currentPlanId);
            if (plan && plan.status === "active") {
                planKey = plan.planKey;
            }
        }

        return NextResponse.json({
            message: "User updated successfully",
            id: updatedUser._id.toString(),
            username: updatedUser.username,
            email: updatedUser.email,
            phone: updatedUser.phone || '',

            role: updatedUser.role,
            plan: planKey,
            onboardingCompleted: updatedUser.onboardingCompleted || false,
            active: updatedUser.active || false,
            emailVerified: updatedUser.emailVerified || false,
        });
    } catch (error) {
        console.error("PUT /api/user/me error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

