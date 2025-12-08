import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";
import Plan from "@/models/support/plan";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

const ALLOWED_UPDATE_FIELDS = ["username", "email", "role", "active"]; // removed "plan"

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sanitizeUser = (user: any, planKey: string = "free") => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    active: user.active,
    plan: planKey,
});

export async function GET(req: NextRequest) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
        if (!isValidObjectId(id)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const user = await User.findById(id).select("-password");
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        let planKey = "free";
        if (user.currentPlanId) {
            const plan = await Plan.findById(user.currentPlanId);
            if (plan && plan.status === "active") {
            planKey = plan.planKey;
            }
        }

        return NextResponse.json({ message: "User retrieved", user: sanitizeUser(user, planKey) }, { status: 200 });
        }

        // Only fetch users with role "user" (exclude admin users)
        const users = await User.find({ role: "user" }).select("-password");
        const enrichedUsers = await Promise.all(
        users.map(async (user) => {
            let planKey = "free";
            if (user.currentPlanId) {
            const plan = await Plan.findById(user.currentPlanId);
            if (plan && plan.status === "active") {
                planKey = plan.planKey;
            }
            }
            return sanitizeUser(user, planKey);
        })
        );

        return NextResponse.json({ message: "All users retrieved", users: enrichedUsers }, { status: 200 });
    } catch (error) {
        console.error("GET /api/users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const username = body.username?.trim();
        const email = body.email?.trim().toLowerCase();
        const password = body.password?.trim();
        const planKey = body.plan || "free";
        const role = body.role || "user";

        if (!username || !email || !password) {
        return NextResponse.json({ error: "Username, email, and password are required." }, { status: 400 });
        }

        if (!isValidEmail(email)) {
        return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return NextResponse.json({ error: "Email already exists." }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
        active: false,
        });

        const savedUser = await newUser.save();

        // Create and link plan
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30); // default to 30 days

        const newPlan = new Plan({
        userId: savedUser._id,
        planKey,
        price: 0,
        durationDays: 30,
        startDate,
        endDate,
        status: "active",
        });

        const savedPlan = await newPlan.save();
        savedUser.currentPlanId = savedPlan._id;
        await savedUser.save();

        return NextResponse.json({
        message: "User created successfully",
        user: sanitizeUser(savedUser, planKey),
        }, { status: 201 });
    } catch (error) {
        console.error("POST /api/users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id || !isValidObjectId(id)) {
        return NextResponse.json({ error: "Valid user ID is required" }, { status: 400 });
        }

        const body = await req.json();
        const updateData: Record<string, any> = {};

        for (const field of ALLOWED_UPDATE_FIELDS) {
        if (body[field] !== undefined) updateData[field] = body[field];
        }

        if (body.password) {
        updateData.password = await bcrypt.hash(body.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
        if (!updatedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // If active status was updated, sync with related records
        if (updateData.active !== undefined) {
            const Store = (await import('@/models/store/store')).default;
            const WhatsAppAccount = (await import('@/models/automation/whatsappAccount')).default;
            const AIAgent = (await import('@/models/automation/ai-agent')).default;
            
            // Update related records to match user's active status
            await Promise.all([
                Store.updateMany({ owner: id }, { active: updateData.active }),
                WhatsAppAccount.updateMany({ owner: id }, { active: updateData.active }),
                AIAgent.updateMany({ owner: id }, { active: updateData.active }),
            ]);
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
        user: sanitizeUser(updatedUser, planKey),
        }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id || !isValidObjectId(id)) {
        return NextResponse.json({ error: "Valid user ID is required" }, { status: 400 });
        }

        const deletedUser = await User.findByIdAndDelete(id).select("-password");
        if (!deletedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Import all models that reference the user
        const Store = (await import('@/models/store/store')).default;
        const WhatsAppAccount = (await import('@/models/automation/whatsappAccount')).default;
        const AIAgent = (await import('@/models/automation/ai-agent')).default;
        const Product = (await import('@/models/store/products')).default;
        const Order = (await import('@/models/store/orders')).default;
        const Notification = (await import('@/models/support/notification')).default;
        const Support = (await import('@/models/support/support')).default;
        const Template = (await import('@/models/automation/templates')).default;
        const AgentVector = (await import('@/models/automation/agentVector')).default;
        const AgentCheckpoint = (await import('@/models/automation/agentCheckpoint')).default;
        const WhatsAppMessage = (await import('@/models/automation/whatsappMessage')).default;

        // Delete all related records from database
        await Promise.all([
            Plan.deleteMany({ userId: deletedUser._id }),
            Store.deleteMany({ owner: deletedUser._id }),
            WhatsAppAccount.deleteMany({ owner: deletedUser._id }),
            AIAgent.deleteMany({ owner: deletedUser._id }),
            Product.deleteMany({ owner: deletedUser._id }),
            Order.deleteMany({ owner: deletedUser._id }),
            Notification.deleteMany({ owner: deletedUser._id }),
            Support.deleteMany({ owner: deletedUser._id }),
            Template.deleteMany({ owner: deletedUser._id }),
            AgentVector.deleteMany({ owner: deletedUser._id }),
            AgentCheckpoint.deleteMany({ owner: deletedUser._id }), // ✅ Added: Delete agent checkpoints
            WhatsAppMessage.deleteMany({ owner: deletedUser._id }),
        ]);

        // ✅ Delete user's uploads folder and all files
        try {
            const userUploadsDir = path.join(process.cwd(), 'public', 'uploads', id);
            
            // Check if directory exists
            if (fsSync.existsSync(userUploadsDir)) {
                // Delete entire directory recursively
                await fs.rm(userUploadsDir, { recursive: true, force: true });
                console.log(`[User Deletion] Deleted uploads folder for user ${id}: ${userUploadsDir}`);
            } else {
                console.log(`[User Deletion] Uploads folder not found for user ${id}, skipping`);
            }
        } catch (uploadError: any) {
            // Log error but don't fail the deletion - file system errors shouldn't block user deletion
            console.error(`[User Deletion] Failed to delete uploads folder for user ${id}:`, uploadError.message);
        }

        return NextResponse.json({
        message: "User and all related data deleted successfully",
        user: sanitizeUser(deletedUser),
        deleted: {
            databaseRecords: true,
            uploadsFolder: true,
        },
        }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
