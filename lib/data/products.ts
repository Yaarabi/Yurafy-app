import { connectDB } from '../db/mongoDB';
import Product from '@/models/products';
import Store, { IStore } from '@/models/store';
import { IProduct } from '@/models/products';


// Custom type for serialized store (safe for frontend use)
export interface SerializedStore {
    _id: string;
    owner?: string;
    brandName: string;
    domain: string;
    description?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    whoWeAre?: string;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
    };
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        buttonColor?: string;
        headerColor?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

function serializeId(id: any): string {
    return id?.toString();
}

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

    const serializedStore: SerializedStore | null = store
        ? {
                _id: serializeId(store._id),
                owner: store.owner ? serializeId(store.owner) : undefined,
                brandName: store.brandName,
                domain: store.domain,
                description: store.description,
                logoUrl: store.logoUrl,
                coverImageUrl: store.coverImageUrl,
                whoWeAre: store.whoWeAre,
                socialLinks: {
                    facebook: store.socialLinks?.facebook,
                    instagram: store.socialLinks?.instagram,
                    twitter: store.socialLinks?.twitter,
                    linkedin: store.socialLinks?.linkedin,
                },
                theme: {
                    primaryColor: store.theme?.primaryColor,
                    secondaryColor: store.theme?.secondaryColor,
                    backgroundColor: store.theme?.backgroundColor,
                    textColor: store.theme?.textColor,
                    buttonColor: store.theme?.buttonColor,
                    headerColor: store.theme?.headerColor,
                },
                createdAt: store.createdAt?.toISOString(),
                updatedAt: store.updatedAt?.toISOString(),
            }
        : null;

    return { product: serializedProduct, store: serializedStore };
}

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
