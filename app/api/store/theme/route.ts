import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import Store from "@/models/store";

connectDB();

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { storeId, theme } = body;

        if (!storeId || !theme) {
        return NextResponse.json({ error: "Missing storeId or theme data" }, { status: 400 });
        }

        const store = await Store.findById(storeId);
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        // Merge safely with defaults for nested fields
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
        console.error(err);
        return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
    }
}
