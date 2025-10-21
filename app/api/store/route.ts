
import { NextRequest, NextResponse } from "next/server";
import Store, { IStore } from "@/models/store";
import { connectDB } from "@/lib/db/mongoDB";
import { domainToASCII } from "node:url";


connectDB();

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const slug = url.searchParams.get("slug");

        if (slug) {
        // Get a single store by slug
        const store = await Store.findOne({ slug }).populate("owner");
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
        return NextResponse.json(store);
        } else {
        // Get all stores
        const stores = await Store.find().populate("owner");
        return NextResponse.json(stores);
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { owner, brandName, domain, description, logoUrl, coverImageUrl, whoWeAre, socialLinks } = body;

        if (!owner || !brandName || !domain) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check domain uniqueness
        const existing = await Store.findOne({ domain });
        if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
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
        });

        return NextResponse.json(store, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
    }
}

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
