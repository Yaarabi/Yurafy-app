import type { SerializedStore } from '@/lib/data/store';

export const STORES: SerializedStore = {
        _id: 'store_modern_tech',
        owner: 'demo_user',
        brandName: 'Future Gadgets',
        domain: 'future-gadgets',
        description: 'Future Gadgets is your premier destination for cutting-edge technology. We bring you the latest innovations that blend seamlessly into your life, enhancing both work and play.',
        themeId: 1,
        theme: { primaryColor: '#0891b2' },
        themeStructure: { header: true, hero: true, about: true, trust: true, productGrid: true, footer: true },
        headerLinks: [{ label: 'New Arrivals', href: '#' }, { label: 'Deals', href: '#' }, { label: 'Support', href: '#' }],
        hero: {
            title: 'Experience Tomorrow, Today.',
            subtitle: 'Cutting-edge technology that seamlessly blends into your life, enhancing both work and play.',
            imageUrl: 'https://picsum.photos/seed/tech_hero/1600/900',
        },
        about: {
            title: 'Pioneering Innovation',
            description: 'Founded in 2020, our mission is to make futuristic technology accessible to everyone. We meticulously curate and test every gadget to ensure it meets our high standards of quality and performance.',
        },
        footer: { text: 'All Rights Reserved.' },
        socialLinks: { twitter: '#', instagram: '#' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };