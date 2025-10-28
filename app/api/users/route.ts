import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import User, { IUser } from "@/models/users";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const ALLOWED_UPDATE_FIELDS = ["username", "email", "plan", "role", "active"];

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sanitizeUser = (user: any) => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    plan: user.plan,
    role: user.role,
    active: user.active,
});

export async function GET(req: Request) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
        if (!isValidObjectId(id)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const user = await User.findById(id).select("-password");
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({ message: "User retrieved", user: sanitizeUser(user) }, { status: 200 });
        }

        const users = await User.find().select("-password");
        return NextResponse.json({
        message: "All users retrieved",
        users: users.map(sanitizeUser),
        }, { status: 200 });
    } catch (error) {
        console.error("GET /api/users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await connectDB();
    try {
        const body = await req.json();
        const username = body.username?.trim();
        const email = body.email?.trim().toLowerCase();
        const password = body.password?.trim();
        const plan = body.plan || "free";
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
        plan,
        role,
        active: false,
        });

        const savedUser = await newUser.save();

        return NextResponse.json({
        message: "User created successfully",
        user: sanitizeUser(savedUser),
        }, { status: 201 });
    } catch (error) {
        console.error("POST /api/users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    await connectDB();
    try {
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

        return NextResponse.json({
        message: "User updated successfully",
        user: sanitizeUser(updatedUser),
        }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id || !isValidObjectId(id)) {
        return NextResponse.json({ error: "Valid user ID is required" }, { status: 400 });
        }

        const deletedUser = await User.findByIdAndDelete(id).select("-password");
        if (!deletedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({
        message: "User deleted successfully",
        user: sanitizeUser(deletedUser),
        }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
