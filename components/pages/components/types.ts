export interface Theme {
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    gradient?: {
        from?: string;
        via?: string;
        to?: string;
    };
}

export interface IStore {
    _id: string;
    name?: string;
    domain: string;
    owner: string;
    logoUrl?: string;
    hero?: {
        imageUrl: string;
        title: string;
        subtitle: string;
    };
    whoWeAre?: string;
    theme?: Theme; // ✅ make optional
}


export interface ISocialLinks {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
}

export interface IHero {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
}

export interface IProduct {
    _id: string | undefined;
    owner: string,
    name: string;
    slug: string;
    description?: string;
    price: number;
    discount?: number;
    stock: number;
    category: string;
    brand?: string;
    mainImage: string;
    images: string[];
    sizes?: string[];
    colors?: string[];
    salesCount: number;
    createdAt: Date;
    updatedAt: Date;
}