import { NextRequest, NextResponse } from "next/server";
import { getStoreByDomain, getAllStores } from "@/lib/data/store";
import { connectDB } from "@/lib/db/mongoDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import Store from "@/models/store";

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
            const store = await getStoreByDomain(slug);
            if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
            return NextResponse.json({ store });
        }

        const stores = await getAllStores();
        return NextResponse.json({ stores });
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
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const {
            brandName,
            domain,
            description,
            themeId,
            theme,
            themeStructure,
            hero,
            about,
            footer,
            socialLinks,
            headerLinks,
        } = body;

        // Prefer authenticated owner when available
        const ownerId = session?.user?.id || body.owner;

        // Validate required fields according to Store schema
        if (!ownerId || !brandName || !domain || !description || !themeId || !theme?.primaryColor ||
            !hero?.title || !hero?.subtitle || !hero?.imageUrl ||
            !about?.title || !about?.description || !footer?.text) {
            return NextResponse.json({ 
                error: "Missing required fields. Required: brandName, domain, description, themeId, theme.primaryColor, hero (title, subtitle, imageUrl), about (title, description), footer.text" 
            }, { status: 400 });
        }

        // Normalize domain (lowercase, remove special chars, hyphenate)
        const normalizedDomain = domain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        const existing = await Store.findOne({ domain: normalizedDomain });
        if (existing) {
            return NextResponse.json({ error: "Domain already exists" }, { status: 400 });
        }

        const store = await Store.create({
            owner: ownerId,
            brandName,
            domain: normalizedDomain,
            description,
            themeId: typeof themeId === 'number' ? themeId : parseInt(themeId || '1', 10),
            theme: {
                primaryColor: theme.primaryColor,
                secondaryColor: theme.secondaryColor,
                textColor: theme.textColor,
            },
            themeStructure: themeStructure || {
                header: true,
                hero: true,
                about: true,
                trust: true,
                productGrid: true,
                footer: true,
            },
            hero: {
                title: hero.title,
                subtitle: hero.subtitle,
                imageUrl: hero.imageUrl,
            },
            about: {
                title: about.title,
                description: about.description,
            },
            footer: {
                text: footer.text,
            },
            socialLinks: socialLinks || {},
            headerLinks: headerLinks || [],
        });

        // Return serialized store via getStoreByDomain for consistency
        const serialized = await getStoreByDomain(store.domain);
        return NextResponse.json({ store: serialized }, { status: 201 });
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
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { storeId, updates } = body;

        if (!storeId || !updates) {
            return NextResponse.json({ error: "Missing storeId or updates" }, { status: 400 });
        }

        // Ensure the authenticated user owns the store
        const storeDoc = await Store.findById(storeId);
        if (!storeDoc) return NextResponse.json({ error: "Store not found" }, { status: 404 });
        if (storeDoc.owner?.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        Object.assign(storeDoc, updates);
        await storeDoc.save();

        const serialized = await getStoreByDomain(storeDoc.domain);
        return NextResponse.json({ store: serialized });
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
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const storeId = url.searchParams.get("storeId");

        if (!storeId) return NextResponse.json({ error: "Missing storeId" }, { status: 400 });

        const storeDoc = await Store.findById(storeId);
        if (!storeDoc) return NextResponse.json({ error: "Store not found" }, { status: 404 });
        if (storeDoc.owner?.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await Store.findByIdAndDelete(storeId);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to delete store" }, { status: 500 });
    }
}
