export type SectionType = 'hero' | 'about' | 'features';

export interface BaseSection {
    id: string;
    type: SectionType;
    visible?: boolean;
}

export interface HeroSection extends BaseSection {
    type: 'hero';
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
}

export interface AboutSection extends BaseSection {
    type: 'about';
    heading?: string;
    description?: string;
    imageUrl?: string;
}

export interface FeaturesSection extends BaseSection {
    type: 'features';
    heading?: string;
    features: Array<{ title: string; description?: string; icon?: string }>;
}

export type StoreSection = HeroSection | AboutSection | FeaturesSection;

export interface StorePageSchema {
    sections: StoreSection[];
}

export function buildSchemaFromStore(store: any): StorePageSchema {
    const sections: StoreSection[] = [];

    if (store?.hero) {
        sections.push({
            id: 'hero',
            type: 'hero',
            title: store.hero.title,
            subtitle: store.hero.subtitle,
            imageUrl: store.hero.imageUrl,
            ctaText: store.hero.ctaText,
            ctaLink: store.hero.ctaLink,
            visible: true,
        });
    }

    if (store?.whoWeAre?.description || store?.whoWeAre?.imageUrl || store?.about) {
        sections.push({
            id: 'about',
            type: 'about',
            heading: store?.about?.title || 'Who We Are',
            description: store?.about?.description || store.whoWeAre?.description,
            imageUrl: store.whoWeAre?.imageUrl,
            visible: true,
        });
    }

    // Placeholder features; can be AI-filled later
    sections.push({
        id: 'features',
        type: 'features',
        heading: 'Why Choose Us',
        features: [],
        visible: false,
    });

    return { sections };
}

