import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";

// 🔹 GET: fetch all users or one user by id
export async function GET(req: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
        const user = await User.findById(id).select("-password");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "User retrieved", user });
        }

        const users = await User.find().select("-password");
        if (users.length === 0) {
        return NextResponse.json({ message: "No users found" }, { status: 404 });
        }

        return NextResponse.json({ message: "All users retrieved", users });
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

// 🔹 PUT: update user by id
export async function PUT(req: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const body = await req.json();

        if (!id) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(id, body, { new: true }).select("-password");
        if (!updatedUser) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        return NextResponse.json({ message: "Error in PUT request", error }, { status: 500 });
    }
}

// 🔹 DELETE: remove user by id
export async function DELETE(req: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        const result = await User.findByIdAndDelete(id).select("-password");
        if (!result) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted", user: result }, { status: 202 });
    } catch (error) {
        return NextResponse.json({ message: "Error in DELETE request", error }, { status: 500 });
    }
}
