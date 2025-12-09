import { connectDB } from '../db/mongoDB';
import Product from '@/models/store/products';
import Store, { IStore } from '@/models/store/store';
import User, { IUser } from '@/models/users';
import { IProduct } from '@/models/store/products';
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
        owner: serializeId(product.owner),
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
        images: product.images?.map((img: any) => img) || [],
        mainImage: product.mainImage || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
        descriptionsImage: product.descriptionsImage || [],
        bundles: product.bundles || undefined,
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

    const { product, store } = serializeProductWithStore(productDoc, storeDoc);
    
    return { product, store };
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
            next: { revalidate: 3600 }, // Cache for 1 hour
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

// ----------------------
// Get All Products for a Store (by store ID)
// ----------------------
export async function getAllStoreProducts(storeId: string): Promise<IProduct[]> {
    if (!storeId || storeId === 'undefined') {
        console.warn("⚠️ getAllStoreProducts called with invalid storeId:", storeId);
        return [];
    }

    try {
        await connectDB();
        
        // Find the store to get the owner ID
        const storeDoc = await Store.findById(storeId).select('owner').lean<{ owner: any }>();
        if (!storeDoc) {
            console.warn("⚠️ Store not found:", storeId);
            return [];
        }

        // Get all products for this owner/store
        const productDocs = await Product.find({ owner: storeDoc.owner }).lean<IProduct[]>();
        
        // Serialize products
        const serializedProducts: IProduct[] = (productDocs || []).map(product => ({
            ...product,
            _id: serializeId(product._id),
            owner: serializeId(product.owner),
            createdAt: product.createdAt instanceof Date ? product.createdAt : new Date(product.createdAt || 0),
            updatedAt: product.updatedAt instanceof Date ? product.updatedAt : new Date(product.updatedAt || 0),
            images: product.images?.map((img: any) => img) || [],
            mainImage: product.mainImage || '',
            sizes: product.sizes || [],
            colors: product.colors || [],
            descriptionsImage: product.descriptionsImage || [],
            bundles: product.bundles || undefined,
        }));

        return serializedProducts;
    } catch (error) {
        console.error("⚠️ Error fetching store products:", error);
        return [];
    }
}
