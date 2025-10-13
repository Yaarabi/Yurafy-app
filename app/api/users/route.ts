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

// 🔹 POST: create a new user
export async function POST(req: Request) {
    await connectDB();

    try {
        const body = await req.json();
        const { name, email, password, brandName, plan, role } = body;

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json({ message: "Name, email, and password are required." }, { status: 400 });
        }

        // Check for existing email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "Email already exists." }, { status: 409 });
        }

        // Optional: check for duplicate brandName if provided
        if (brandName) {
            const brandConflict = await User.findOne({ brandName });
            if (brandConflict) {
                return NextResponse.json({ message: "Brand name already in use." }, { status: 409 });
            }
        }

        // Hash password
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            brandName: brandName || undefined,
            plan: plan || "free",
            role: role || "user"
        });

        const savedUser = await newUser.save();

        return NextResponse.json({
            message: "User created successfully",
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                brandName: savedUser.brandName,
                plan: savedUser.plan,
                role: savedUser.role
            }
        }, { status: 201 });
    } catch (error) {
        console.error("POST /api/user error:", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

