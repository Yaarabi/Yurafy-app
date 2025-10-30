import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import User from "@/models/users";

export async function GET(req: NextRequest) {
    await connectDB();
    const token = await getToken({ req });

    if (!token?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
        plan: user.plan,
        role: user.role,
        id: user._id.toString(),
    });
}
