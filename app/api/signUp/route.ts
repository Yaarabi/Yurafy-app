
import { connectDB } from "@/lib/db/mongoDB"; 
import User from "@/models/users";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    try {
        await connectDB();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return NextResponse.json({ error: "Email already exists!" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        const savedUser = await newUser.save();

        return NextResponse.json({
        message: "User registered successfully",
        user: {
            name: savedUser.name,
            email: savedUser.email,
        },
        }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    }