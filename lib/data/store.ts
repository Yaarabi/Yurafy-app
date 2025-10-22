
import { connectDB } from "@/lib/db/mongoDB";
import Store, { IStore } from "@/models/store";


export interface SerializedStore {
    _id: string;
    owner: string;
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
        email?: string;
        whatsapp?: string;
    };
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        buttonColor?: string;
        headerColor?: string;
        footerColor?: string;
        borderColor?: string;
        gradient?: { from?: string; via?: string; to?: string };
        borderRadius?: string;
        shadow?: boolean;
        fontFamily?: string;
        headingWeight?: string;
        buttonStyle?: "solid" | "outline" | "ghost";
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
        coverImageUrl: store.coverImageUrl,
        whoWeAre: store.whoWeAre,
        socialLinks: { ...store.socialLinks },
        theme: {
            primaryColor: store.theme?.primaryColor,
            secondaryColor: store.theme?.secondaryColor,
            backgroundColor: store.theme?.backgroundColor,
            textColor: store.theme?.textColor,
            buttonColor: store.theme?.buttonColor,
            headerColor: store.theme?.headerColor,
            footerColor: store.theme?.footerColor,
            borderColor: store.theme?.borderColor, 
            gradient: { ...store.theme?.gradient },
            borderRadius: store.theme?.borderRadius,
            shadow: store.theme?.shadow,
            fontFamily: store.theme?.fontFamily,
            headingWeight: store.theme?.headingWeight,
            buttonStyle: store.theme?.buttonStyle,
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
