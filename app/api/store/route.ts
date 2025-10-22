import { NextRequest, NextResponse } from "next/server";
import Store, { IStore } from "@/models/store";
import { connectDB } from "@/lib/db/mongoDB";

connectDB();

/**
 * GET /api/stores?slug=optional
 * - Get all stores or a single store by slug
 */
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const slug = url.searchParams.get("slug");

        if (slug) {
        const store = await Store.findOne({ domain: slug });
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
        return NextResponse.json(store);
        }

        const stores = await Store.find();
        return NextResponse.json(stores);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
    }
}

/**
 * POST /api/stores
 * - Create a new store
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
        owner,
        brandName,
        domain,
        description,
        logoUrl,
        coverImageUrl,
        whoWeAre,
        socialLinks,
        theme,
        hero,
        } = body;

        if (!owner || !brandName || !domain) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existing = await Store.findOne({ domain });
        if (existing) {
        return NextResponse.json({ error: "Domain already exists" }, { status: 400 });
        }

        const store = await Store.create({
        owner,
        brandName,
        domain,
        description,
        logoUrl,
        coverImageUrl,
        whoWeAre,
        socialLinks,
        theme,
        hero,
        });

        return NextResponse.json(store, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
    }
}

/**
 * PATCH /api/stores
 * - Update store details
 */
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { storeId, updates } = body;

        if (!storeId || !updates) {
        return NextResponse.json({ error: "Missing storeId or updates" }, { status: 400 });
        }

        const store = await Store.findByIdAndUpdate(storeId, updates, { new: true });
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        return NextResponse.json(store);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
    }
}

/**
 * DELETE /api/stores?storeId=...
 * - Delete a store
 */
export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const storeId = url.searchParams.get("storeId");

        if (!storeId) return NextResponse.json({ error: "Missing storeId" }, { status: 400 });

        const store = await Store.findByIdAndDelete(storeId);
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to delete store" }, { status: 500 });
    }
}
