import { connectDB } from '../db/mongoDB';
import Product from '@/models/products';
import User from '@/models/users';
import { IProduct } from '@/models/products';

export interface IOwner {
    _id: string;
    name: string;
    brandName?: string;
    logo?: string;
    email: string;
    phone?: string;
    plan: 'store' | 'insta bot' | 'whatsapp bot' | 'Pro' | 'free';
    role: 'user' | 'admin';
}

function serializeId(id: any) {
    return id?._id ? id._id.toString() : id?.toString();
}

function serializeProduct(product: any, owner?: any) {
    const serializedProduct: IProduct = {
        ...product,
        _id: serializeId(product._id),
        owner: typeof product.owner === 'object' ? serializeId(product.owner) : product.owner,
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
        images: product.images?.map((img: any) => img), 
        mainImage: product.mainImage, 
    };

    const serializedOwner = owner
        ? { ...owner, _id: serializeId(owner._id) }
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

    const ownerDoc = productDoc.owner ? await User.findById(productDoc.owner).lean<IOwner>() : null;

    return serializeProduct(productDoc, ownerDoc);
}
