import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // ⬅️ Add this
import { authOptions } from "@/lib/auth/auth"; 
import { connectDB } from "@/lib/db/mongoDB";
import Store from "@/models/store";

connectDB();

export async function PATCH(req: NextRequest) {
    try {
        // ✅ Get session
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ Parse request body
        const body = await req.json();
        const { theme } = body;

        if (!theme) {
        return NextResponse.json(
            { error: "Missing theme data" },
            { status: 400 }
        );
        }

        // ✅ Find store owned by the logged-in user
        const store = await Store.findOne({ owner: session.user.id });
        if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // ✅ Merge theme safely
        store.theme = {
        ...store.theme,
        ...theme,
        gradient: {
            ...store.theme?.gradient,
            ...theme.gradient,
        },
        };

        await store.save();

        return NextResponse.json({ success: true, theme: store.theme });
    } catch (err) {
        console.error("Theme update failed:", err);
        return NextResponse.json(
        { error: "Failed to update theme" },
        { status: 500 }
        );
    }
}
