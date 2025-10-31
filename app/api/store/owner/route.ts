
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

// Local serializer to avoid circular import in edge runtimes
function serializeStoreDoc(store: any) {
    return {
        _id: store._id?.toString(),
        owner: store.owner?.toString(),
        brandName: store.brandName,
        domain: store.domain,
        description: store.description,
        logoUrl: store.logoUrl,
        faviconUrl: store.faviconUrl,
        whoWeAre: store.whoWeAre ? { ...store.whoWeAre } : undefined,
        socialLinks: store.socialLinks ? { ...store.socialLinks } : undefined,
        theme: store.theme ? { ...store.theme } : undefined,
        hero: store.hero ? { ...store.hero } : undefined,
        customization: store.customization ? { ...store.customization } : undefined,
        seo: store.seo ? { ...store.seo } : undefined,
        businessInfo: store.businessInfo ? { ...store.businessInfo } : undefined,
        paymentMethods: store.paymentMethods ? [...store.paymentMethods] : undefined,
        codEnabled: store.codEnabled,
        shippingInfo: store.shippingInfo ? { ...store.shippingInfo } : undefined,
        createdAt: store.createdAt?.toISOString(),
        updatedAt: store.updatedAt?.toISOString(),
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

        // Normalize domain if provided
        if (updates.domain && typeof updates.domain === 'string') {
            updates.domain = updates.domain.toLowerCase().trim();
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
