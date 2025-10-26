
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import Store from "@/models/store";
import { connectDB } from "@/lib/db/mongoDB";

connectDB();

/**
 * GET /api/stores/byOwner
 * - Fetch the store that belongs to the currently authenticated user
 */
export async function GET(req: NextRequest) {
    try {
        // 🔐 Get the logged-in user from the session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // 🏪 Find the store belonging to this user
        const store = await Store.findOne({ owner: session.user.id });

        if (!store) {
        return NextResponse.json({ message: "No store found for this user" }, { status: 404 });
        }

        return NextResponse.json(store);
    } catch (err) {
        console.error("Error fetching store by owner:", err);
        return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 });
    }
}
