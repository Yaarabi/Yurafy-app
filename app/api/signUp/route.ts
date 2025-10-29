import { connectDB } from "@/lib/db/mongoDB"; 
import User from "@/models/users";
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

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: "user",  // default role
            plan: null,  // default plan
            active: false, // default active state
        });

        const savedUser = await newUser.save();

        // Return sanitized user info
        return NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    id: savedUser._id.toString(),
                    username: savedUser.username,
                    email: savedUser.email,
                    role: savedUser.role,
                    plan: savedUser.plan,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
