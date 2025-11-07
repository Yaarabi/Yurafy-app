
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import Store from "@/models/store";
import { connectDB } from "@/lib/db/mongoDB";
import type { IStore } from "@/models/store";
import { 
    // reuse the serializer to ensure consistent shape
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
} from "@/lib/data/store";

// Local serializer aligned with Store schema
function serializeStoreDoc(store: any) {
    return {
        _id: store._id?.toString(),
        owner: store.owner?.toString(),
        brandName: store.brandName || '',
        domain: store.domain || '',
        description: store.description || '',
        themeId: store.themeId || 1,
        theme: store.theme ? {
            primaryColor: store.theme.primaryColor,
            secondaryColor: store.theme.secondaryColor,
            textColor: store.theme.textColor,
        } : undefined,
        themeStructure: store.themeStructure ? {
            header: store.themeStructure.header ?? true,
            hero: store.themeStructure.hero ?? true,
            about: store.themeStructure.about ?? true,
            trust: store.themeStructure.trust ?? true,
            productGrid: store.themeStructure.productGrid ?? true,
            footer: store.themeStructure.footer ?? true,
        } : {
            header: true,
            hero: true,
            about: true,
            trust: true,
            productGrid: true,
            footer: true,
        },
        hero: store.hero ? {
            title: store.hero.title,
            subtitle: store.hero.subtitle,
            imageUrl: store.hero.imageUrl,
        } : undefined,
        about: store.about ? {
            title: store.about.title,
            description: store.about.description,
        } : undefined,
        footer: store.footer ? {
            text: store.footer.text,
        } : undefined,
        socialLinks: store.socialLinks ? { ...store.socialLinks } : undefined,
        whatsappNumber: store.whatsappNumber || undefined,
        headerLinks: store.headerLinks ? store.headerLinks.map((link: any) => ({
            label: link.label,
            href: link.href,
        })) : [],
        createdAt: store.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: store.updatedAt?.toISOString() || new Date().toISOString(),
    };
}

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

        return NextResponse.json(serializeStoreDoc(store));
    } catch (err) {
        console.error("Error fetching store by owner:", err);
        return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 });
    }
}

/**
 * PATCH /api/store/owner
 * - Update the current user's store
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await req.json();
        const { updates } = body || {};
        if (!updates || typeof updates !== 'object') {
            return NextResponse.json({ error: "Missing updates" }, { status: 400 });
        }

        // Normalize domain if provided (lowercase, remove special chars, hyphenate)
        if (updates.domain && typeof updates.domain === 'string') {
            updates.domain = updates.domain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            
            // Check if domain is already taken by another store
            const existingStore = await Store.findOne({ 
                domain: updates.domain,
                owner: { $ne: session.user.id } // Exclude current user's store
            });
            
            if (existingStore) {
                return NextResponse.json({ error: "Domain is already taken" }, { status: 400 });
            }
        }

        const store = await Store.findOneAndUpdate(
            { owner: session.user.id },
            updates,
            { new: true }
        );

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        return NextResponse.json(serializeStoreDoc(store));
    } catch (err) {
        console.error("Error updating store by owner:", err);
        return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
    }
}
