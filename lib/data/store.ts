
import { connectDB } from '@/lib/db/mongoDB';
import Store from '@/models/store';
import { SerializedStore } from '@/lib/data/products'; // or wherever it's defined

function serializeStore(store: any): SerializedStore {
    return {
        _id: store._id?.toString(),
        owner: store.owner?.toString(),
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
    };
}

export async function getStoreByDomain(domain: string): Promise<SerializedStore | null> {
    await connectDB();

    const storeDoc = await Store.findOne({ domain }).lean();
    if (!storeDoc) return null;

    return serializeStore(storeDoc);
}
