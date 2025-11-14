
import { connectDB } from "@/lib/db/mongoDB";
import Store, { IStore } from "@/models/store";
import User, { IUser } from "@/models/users";


export interface SerializedStore {
    _id: string;
    owner: string;
    brandName: string;
    domain: string;
    description: string;
    language?: string;
    themeId: number;
    theme: {
        primaryColor: string;
        secondaryColor?: string;
        textColor?: string;
        surfaceColor?: string;
    };
    themeStructure: {
        header: boolean;
        hero: boolean;
        about: boolean;
        trust: boolean;
        productGrid: boolean;
        footer: boolean;
    };
    hero: {
        title: string;
        subtitle: string;
        imageUrl: string;
    };
    about: {
        title: string;
        description: string;
    };
    footer: {
        text: string;
    };
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        tiktok?: string;
    };
    whatsappNumber?: string;
    headerLinks: Array<{
        label: string;
        href: string;
    }>;
    createdAt: string;
    updatedAt: string;
    // Legacy fields for backward compatibility (not in schema, but may be in old data)
    logoUrl?: string;
    faviconUrl?: string;
    whoWeAre?: { description?: string; imageUrl?: string };
    customization?: any;
    seo?: any;
    businessInfo?: any;
    paymentMethods?: string[];
    codEnabled?: boolean;
    shippingInfo?: any;
}


export function serializeStore(store: any): SerializedStore {
    // Ensure all required fields from Store schema are present
    return {
        _id: store._id?.toString() || '',
        owner: store.owner?.toString() || '',
        brandName: store.brandName || '',
        domain: store.domain || '',
        description: store.description || '',
        language: store.language || 'en',
        themeId: typeof store.themeId === 'number' ? store.themeId : parseInt(store.themeId || '1', 10),
        theme: {
            primaryColor: store.theme?.primaryColor || '#3B82F6',
            secondaryColor: store.theme?.secondaryColor,
            textColor: store.theme?.textColor,
            surfaceColor: store.theme?.surfaceColor,
        },
        themeStructure: {
            header: store.themeStructure?.header ?? true,
            hero: store.themeStructure?.hero ?? true,
            about: store.themeStructure?.about ?? true,
            trust: store.themeStructure?.trust ?? true,
            productGrid: store.themeStructure?.productGrid ?? true,
            footer: store.themeStructure?.footer ?? true,
        },
        hero: {
            title: store.hero?.title || '',
            subtitle: store.hero?.subtitle || '',
            imageUrl: store.hero?.imageUrl || '',
        },
        about: {
            title: store.about?.title || '',
            description: store.about?.description || '',
        },
        footer: {
            text: store.footer?.text || '',
        },
        socialLinks: store.socialLinks ? {
            facebook: store.socialLinks.facebook,
            instagram: store.socialLinks.instagram,
            tiktok: store.socialLinks.tiktok,
        } : undefined,
        whatsappNumber: store.whatsappNumber || undefined,
        headerLinks: store.headerLinks ? store.headerLinks.map((link: any) => ({
            label: link.label,
            href: link.href,
        })) : [],
        // Include logoUrl if it exists in the store, or keep it undefined
        logoUrl: store.logoUrl || undefined,
        faviconUrl: store.faviconUrl || undefined,
        whoWeAre: store.whoWeAre || undefined,
        customization: store.customization || undefined,
        seo: store.seo || undefined,
        businessInfo: store.businessInfo || undefined,
        paymentMethods: store.paymentMethods || undefined,
        codEnabled: store.codEnabled || undefined,
        shippingInfo: store.shippingInfo || undefined,
        createdAt: store.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: store.updatedAt?.toISOString() || new Date().toISOString(),
    };
}

export async function getStoreByDomain(domain: string): Promise<SerializedStore | null> {
    await connectDB();
    const storeDoc = await Store.findOne({ domain }).lean<IStore>();
    if (!storeDoc) return null;
    
    const serialized = serializeStore(storeDoc);
    
    return serialized;
}

export async function getAllStores(): Promise<SerializedStore[]> {
    await connectDB();
    const docs = await Store.find().lean();
    return docs.map((d: any) => serializeStore(d));
}
