
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
    themeId?: string;
    hero?: {
        title?: string;
        subtitle?: string;
        imageUrl?: string;
        ctaText?: string;
        ctaLink?: string;
    };
    about?: {
        title?: string;
        description?: string;
    };
    footer?: {
        text?: string;
    };
    themeStructure?: {
        header?: boolean;
        hero?: boolean;
        about?: boolean;
        trust?: boolean;
        productGrid?: boolean;
        footer?: boolean;
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
    headerLinks?: Array<{
        label: string;
        href: string;
    }>;
    createdAt: string;
    updatedAt: string;
}


export function serializeStore(store: any): SerializedStore {
    return {
        _id: store._id?.toString(),
        owner: store.owner?.toString() || '',
        brandName: store.brandName || '',
        domain: store.domain || '',
        description: store.description || '',
        logoUrl: store.logoUrl,
        faviconUrl: store.faviconUrl,
        whoWeAre: store.whoWeAre ? {
            description: store.whoWeAre?.description,
            imageUrl: store.whoWeAre?.imageUrl,
        } : undefined,
        socialLinks: store.socialLinks ? { ...store.socialLinks } : undefined,
        theme: store.theme ? {
            primaryColor: store.theme?.primaryColor,
            secondaryColor: store.theme?.secondaryColor,
            textColor: store.theme?.textColor,
            gradient: { ...store.theme?.gradient },
        } : undefined,
        themeId: (store as any).themeId?.toString() || '1',
        hero: store.hero ? { ...store.hero } : undefined,
        about: store.about ? {
            title: store.about.title,
            description: store.about.description,
        } : undefined,
        footer: store.footer ? {
            text: store.footer.text,
        } : undefined,
        themeStructure: store.themeStructure ? {
            header: store.themeStructure.header ?? true,
            hero: store.themeStructure.hero ?? true,
            about: store.themeStructure.about ?? true,
            trust: store.themeStructure.trust ?? true,
            productGrid: store.themeStructure.productGrid ?? true,
            footer: store.themeStructure.footer ?? true,
        } : undefined,
        customization: store.customization ? { ...store.customization } : undefined,
        seo: store.seo ? { ...store.seo } : undefined,
        businessInfo: store.businessInfo ? { ...store.businessInfo } : undefined,
        paymentMethods: store.paymentMethods ? [...store.paymentMethods] : undefined,
        codEnabled: (store as any).codEnabled,
        shippingInfo: store.shippingInfo ? { ...store.shippingInfo } : undefined,
        headerLinks: store.headerLinks ? [...store.headerLinks] : [],
        createdAt: store.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: store.updatedAt?.toISOString() || new Date().toISOString(),
    };
}

export async function getStoreByDomain(domain: string): Promise<SerializedStore | null> {
    await connectDB();
    const storeDoc = await Store.findOne({ domain }).lean<IStore>();
    if (!storeDoc) return null;
    return serializeStore(storeDoc);
}

export async function getAllStores(): Promise<SerializedStore[]> {
    await connectDB();
    const docs = await Store.find().lean();
    return docs.map((d: any) => serializeStore(d));
}
