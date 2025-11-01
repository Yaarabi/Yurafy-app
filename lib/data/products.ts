import { connectDB } from '../db/mongoDB';
import Product from '@/models/products';
import Store, { IStore } from '@/models/store';
import { IProduct } from '@/models/products';
import { serializeStore, SerializedStore } from './store';

// ----------------------
// Serialized Store Interface
// ----------------------
// Use SerializedStore from store.ts to maintain consistency
export type { SerializedStore } from './store';

// ----------------------
// Helper: Serialize ID
// ----------------------
function serializeId(id: any): string {
    return id?.toString();
}

// ----------------------
// Serialize Product + Store
// ----------------------
function serializeProductWithStore(product: any, store?: any): {
    product: IProduct;
    store: SerializedStore | null;
    } {
    const serializedProduct: IProduct = {
        ...product,
        _id: serializeId(product._id),
        owner: undefined,
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
        images: product.images?.map((img: any) => img) || [],
        mainImage: product.mainImage || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
    };

    const serializedStore: SerializedStore | null = store ? serializeStore(store) : null;

    return { product: serializedProduct, store: serializedStore };
}

// ----------------------
// Main Function
// ----------------------
export async function getProductWithStoreBySlug(slug: string): Promise<{
    product: IProduct | null;
    store: SerializedStore | null;
    }> {
    await connectDB();

    const productDoc = await Product.findOne({ slug }).lean<IProduct>();
    if (!productDoc) return { product: null, store: null };

    let storeDoc = null;
    if (productDoc.owner) {
        storeDoc = await Store.findOne({ owner: productDoc.owner }).lean<IStore>();
    }

    return serializeProductWithStore(productDoc, storeDoc);
}


export async function getProductsByOwner(ownerId: string): Promise<IProduct[]> {
    if (!ownerId || ownerId === 'undefined') {
        console.warn("⚠️ getProductsByOwner called with invalid ownerId:", ownerId);
        return [];
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/products?owner=${ownerId}`, {
            method: "GET",
            cache: 'no-store', // Don't cache in server components to avoid stale data
        });

        if (!res.ok) {
            console.error("❌ Failed to fetch products:", res.statusText);
            return [];
        }

        const data = await res.json();
        return data.products || [];
    } catch (error) {
        console.error("⚠️ Error fetching products:", error);
        return [];
    }
}
