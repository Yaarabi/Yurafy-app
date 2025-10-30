import { connectDB } from "@/lib/db/mongoDB"; 
import User from "@/models/users";
import Plan from "@/models/plan";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const username = body.username?.trim();
        const email = body.email?.trim().toLowerCase();
        const password = body.password?.trim();

        // Validate required fields
        if (!username || !email || !password) {
        return NextResponse.json(
            { error: "All fields are required." },
            { status: 400 }
        );
        }

        // Connect to DB
        await connectDB();

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return NextResponse.json(
            { error: "Email already exists!" },
            { status: 409 }
        );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user (without plan yet)
        const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: "user",
        active: false,
        });

        const savedUser = await newUser.save();

        // Create default "free" plan
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 365); // free plan lasts 1 year or unlimited

        const freePlan = new Plan({
        userId: savedUser._id,
        planKey: "free",
        price: 0,
        durationDays: 365,
        startDate,
        endDate,
        status: "active",
        });

        const savedPlan = await freePlan.save();

        // Link plan to user
        savedUser.currentPlanId = savedPlan._id;
        await savedUser.save();

        // Return sanitized user info
        return NextResponse.json(
        {
            message: "User registered successfully",
            user: {
            id: savedUser._id.toString(),
            username: savedUser.username,
            email: savedUser.email,
            role: savedUser.role,
            plan: savedPlan.planKey,
            },
        },
        { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
