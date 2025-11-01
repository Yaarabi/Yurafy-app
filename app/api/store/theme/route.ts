import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // ⬅️ Add this
import { authOptions } from "@/lib/auth/auth"; 
import { connectDB } from "@/lib/db/mongoDB";
import Store from "@/models/store";
import { getThemeById } from "@/lib/store/themes";

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
        const { themeId } = body;
        if (!themeId) {
            return NextResponse.json({ error: "Missing themeId" }, { status: 400 });
        }
        const def = getThemeById(themeId);
        if (!def) {
            return NextResponse.json({ error: "Invalid themeId" }, { status: 400 });
        }

        // ✅ Find store owned by the logged-in user
        const store = await Store.findOne({ owner: session.user.id });
        if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // ✅ Apply theme from registry and persist themeId
        store.theme = {
            primaryColor: def.colorTokens.primaryColor,
            secondaryColor: def.colorTokens.secondaryColor,
            textColor: def.colorTokens.textColor,
            gradient: {
                from: def.colorTokens.gradient?.from,
                via: def.colorTokens.gradient?.via,
                to: def.colorTokens.gradient?.to,
            },
        };
        (store as any).themeId = def.id;

        await store.save();

        return NextResponse.json({ success: true, theme: store.theme, themeId: def.id });
    } catch (err) {
        console.error("Theme update failed:", err);
        return NextResponse.json(
        { error: "Failed to update theme" },
        { status: 500 }
        );
    }
}
