import { connectDB } from '../db/mongoDB';
import Product from '@/models/products';
import User from '@/models/users';
import { IProduct } from '@/models/products';

export interface IOwner {
    _id: string;
    name: string;
    brandName?: string;
    logo?: string;
    email?: string;
    phone?: string;
    plan: 'store' | 'insta bot' | 'whatsapp bot' | 'Pro' | 'free';
    role: 'user' | 'admin';
}

function serializeId(id: any) {
    return id?.toString();
}

function serializeProduct(product: any, owner?: any) {
    const serializedProduct: IProduct = {
        ...product,
        _id: serializeId(product._id),
        owner: undefined, // remove nested owner object
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
        images: product.images?.map((img: any) => img) || [],
        mainImage: product.mainImage || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
    };

    const serializedOwner: IOwner | null = owner
        ? {
            _id: serializeId(owner._id),
            name: owner.name,
            brandName: owner.brandName || undefined,
            logo: owner.logo || undefined,
            email: owner.email || undefined,
            phone: owner.phone || undefined,
            plan: owner.plan,
            role: owner.role,
        }
        : null;

    return { product: serializedProduct, owner: serializedOwner };
    }

export async function getProductWithOwnerBySlug(slug: string): Promise<{
    product: IProduct | null;
    owner: IOwner | null;
    }> {
    await connectDB();

    const productDoc = await Product.findOne({ slug }).lean<IProduct>();
    if (!productDoc) return { product: null, owner: null };

    let ownerDoc: IOwner | null = null;
    if (productDoc.owner) {
        ownerDoc = await User.findById(productDoc.owner).lean<IOwner>();
    }

    return serializeProduct(productDoc, ownerDoc);
}
