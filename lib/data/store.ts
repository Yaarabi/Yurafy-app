
import { connectDB } from "@/lib/db/mongoDB";
import Store, { IStore } from "@/models/store";


export interface SerializedStore {
    _id: string;
    owner: string;
    brandName: string;
    domain: string;
    description?: string;
    logoUrl?: string;
    faviconUrl?: string;
    whoWeAre?: { description?: string; imageUrl?: string };
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
        youtube?: string;
        tiktok?: string;
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
        ctaText?: string;
        ctaLink?: string;
    };
    customization?: {
        layout?: 'grid' | 'list' | 'masonry';
        showCategories?: boolean;
        showFilters?: boolean;
        productsPerPage?: number;
        enableSearch?: boolean;
        enableReviews?: boolean;
        enableWishlist?: boolean;
        enableCompare?: boolean;
        footerText?: string;
        customCSS?: string;
        customJS?: string;
    };
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
        ogImage?: string;
    };
    businessInfo?: {
        address?: string;
        city?: string;
        country?: string;
        phone?: string;
        email?: string;
        workingHours?: string;
        taxId?: string;
    };
    paymentMethods?: string[];
    codEnabled?: boolean;
    shippingInfo?: {
        freeShippingThreshold?: number;
        shippingZones?: Array<{
            name: string;
            countries: string[];
            price: number;
        }>;
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
        faviconUrl: store.faviconUrl,
        whoWeAre: {
            description: store.whoWeAre?.description,
            imageUrl: store.whoWeAre?.imageUrl,
        },
        socialLinks: { ...store.socialLinks },
        theme: {
            primaryColor: store.theme?.primaryColor,
            secondaryColor: store.theme?.secondaryColor,
            textColor: store.theme?.textColor,
            gradient: { ...store.theme?.gradient },
        },
        hero: { ...store.hero },
        customization: { ...store.customization },
        seo: { ...store.seo },
        businessInfo: { ...store.businessInfo },
        paymentMethods: store.paymentMethods ? [...store.paymentMethods] : undefined,
        codEnabled: (store as any).codEnabled,
        shippingInfo: { ...store.shippingInfo },
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
