
import { connectDB } from "@/lib/db/mongoDB";
import Store, { IStore } from "@/models/store";


export interface SerializedStore {
    _id: string;
    owner: string;
    brandName: string;
    domain: string;
    description?: string;
    logoUrl?: string;
    whoWeAre?: string;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
        email?: string;
        whatsapp?: string;
    };
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        textColor?: string;
        gradient?: { from?: string; via?: string; to?: string };
    };
    hero?: {
        title?: string;
        subtitle?: string;
        imageUrl?: string;
    };
    createdAt: string;
    updatedAt: string;
}


function serializeStore(store: IStore): SerializedStore {
    return {
        _id: store._id?.toString(),
        owner: store.owner?.toString(),
        brandName: store.brandName,
        domain: store.domain,
        description: store.description,
        logoUrl: store.logoUrl,
        whoWeAre: store.whoWeAre,
        socialLinks: { ...store.socialLinks },
        theme: {
            primaryColor: store.theme?.primaryColor,
            secondaryColor: store.theme?.secondaryColor,
            textColor: store.theme?.textColor,
            gradient: { ...store.theme?.gradient },
        },
        hero: { ...store.hero },
        createdAt: store.createdAt?.toISOString(),
        updatedAt: store.updatedAt?.toISOString(),
    };
}

export async function getStoreByDomain(domain: string): Promise<SerializedStore | null> {
    await connectDB();
    const storeDoc = await Store.findOne({ domain }).lean<IStore>();
    if (!storeDoc) return null;
    return serializeStore(storeDoc);
}
