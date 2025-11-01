import type { Store } from '../types';

export const STORES: Store[] = [
    {
        _id: 'store_modern_tech',
        brandName: 'Future Gadgets',
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
        products: [
            {
                _id: 'prod_drone_x1', owner: 'store_modern_tech', name: 'AeroDrone X1', slug: 'aerodrone-x1', description: 'A professional-grade quadcopter with a 4K camera.', price: 799.99, stock: 30, category: 'Drones', brand: 'Aero',
                mainImage: 'https://picsum.photos/seed/drone1/800/600',
                images: ['https://picsum.photos/seed/drone1/800/600', 'https://picsum.photos/seed/drone2/800/600']
            },
            {
                _id: 'prod_vr_headset', owner: 'store_modern_tech', name: 'VirtuSphere VR', slug: 'virtusphere-vr', description: 'Immerse yourself in new worlds with our next-gen VR headset.', price: 349.00, stock: 50, category: 'VR', brand: 'VirtuSphere',
                mainImage: 'https://picsum.photos/seed/vr1/800/600',
                images: ['https://picsum.photos/seed/vr1/800/600', 'https://picsum.photos/seed/vr2/800/600']
            },
            {
                _id: 'prod_smart_watch', owner: 'store_modern_tech', name: 'ChronoLink Watch', slug: 'chronolink-watch', description: 'Stay connected and track your fitness.', price: 249.50, stock: 120, category: 'Wearables', brand: 'ChronoLink',
                mainImage: 'https://picsum.photos/seed/watch1/800/600',
                images: ['https://picsum.photos/seed/watch1/800/600', 'https://picsum.photos/seed/watch2/800/600'],
                sizes: ['S/M', 'M/L'],
                colors: ['#333333', '#E5E7EB', '#F59E0B']
            },
            {
                _id: 'prod_speaker', owner: 'store_modern_tech', name: 'SonoWave Speaker', slug: 'sonowave-speaker', description: 'A powerful, portable Bluetooth speaker.', price: 129.99, stock: 80, category: 'Audio', brand: 'SonoWave',
                mainImage: 'https://picsum.photos/seed/speaker1/800/600',
                images: ['https://picsum.photos/seed/speaker1/800/600', 'https://picsum.photos/seed/speaker2/800/600']
            },
        ],
    },
    {
        _id: 'store_artisan_goods',
        brandName: 'The Artisan Mill',
        description: 'The Artisan Mill is a curated collection of handcrafted goods from makers around the world. Every item tells a story of tradition, quality, and passion.',
        themeId: 2,
        theme: { primaryColor: '#ca8a04' },
        themeStructure: { header: true, hero: true, about: true, trust: true, productGrid: true, footer: true },
        headerLinks: [{ label: 'Collections', href: '#' }, { label: 'Our Story', href: '#about' }],
        hero: {
            title: 'Handcrafted with Passion.',
            subtitle: 'Discover unique goods from makers around the world. Every item tells a story of tradition and quality.',
            imageUrl: 'https://picsum.photos/seed/artisan_hero/1600/900',
        },
        about: {
            title: 'The Hands Behind the Craft',
            description: 'We travel the globe to partner with skilled artisans, bringing their timeless creations to you. We believe in fair trade and preserving traditional craftsmanship for future generations to enjoy.',
        },
        footer: { text: 'Crafted with care.' },
        socialLinks: { facebook: '#', instagram: '#' },
        products: [
            {
                _id: 'prod_leather_journal', owner: 'store_artisan_goods', name: 'Leather-Bound Journal', slug: 'leather-bound-journal', description: 'Handcrafted journal with premium paper.', price: 45.00, stock: 60, category: 'Stationery', brand: 'Artisan Mill',
                mainImage: 'https://picsum.photos/seed/journal1/800/600',
                images: ['https://picsum.photos/seed/journal1/800/600', 'https://picsum.photos/seed/journal2/800/600']
            },
            {
                _id: 'prod_ceramic_mug', owner: 'store_artisan_goods', name: 'Handmade Ceramic Mug', slug: 'handmade-ceramic-mug', description: 'A unique, wheel-thrown ceramic mug.', price: 28.00, stock: 40, category: 'Homeware', brand: 'Artisan Mill',
                mainImage: 'https://picsum.photos/seed/mug1/800/600',
                images: ['https://picsum.photos/seed/mug1/800/600', 'https://picsum.photos/seed/mug2/800/600']
            },
            {
                _id: 'prod_wool_blanket', owner: 'store_artisan_goods', name: 'Woven Wool Blanket', slug: 'woven-wool-blanket', description: 'A soft, warm blanket made from 100% natural wool.', price: 120.00, stock: 25, category: 'Textiles', brand: 'Artisan Mill',
                mainImage: 'https://picsum.photos/seed/blanket1/800/600',
                images: ['https://picsum.photos/seed/blanket1/800/600', 'https://picsum.photos/seed/blanket2/800/600'],
                colors: ['#A1A1AA', '#3F3F46', '#BE123C']
            },
        ],
    },
    {
        _id: 'store_eco_friendly',
        brandName: 'GreenLeaf Living',
        description: 'At GreenLeaf Living, we believe that small changes can make a big impact. We offer a range of eco-friendly products that are good for you and good for the Earth.',
        themeId: 3,
        theme: { primaryColor: '#16a34a' },
        themeStructure: { header: true, hero: true, about: true, trust: true, productGrid: true, footer: true },
        headerLinks: [{ label: 'Shop All', href: '#products' }, { label: 'Our Mission', href: '#about' }],
        hero: {
            title: 'Sustainable Choices for a Better Planet.',
            subtitle: 'Join us in making a positive impact with our range of eco-friendly products that are good for you and the Earth.',
            imageUrl: 'https://picsum.photos/seed/eco_hero/1600/900',
        },
        about: {
            title: 'Live Green, Live Better',
            description: 'Our journey began with a simple idea: to make sustainable living easy and accessible. From plastic-free alternatives to organic goods, every product is chosen to help you reduce your environmental footprint.',
        },
        footer: { text: 'Think Green.' },
        socialLinks: { facebook: '#', instagram: '#' },
        products: [
            {
                _id: 'prod_bamboo_utensils', owner: 'store_eco_friendly', name: 'Bamboo Utensil Set', slug: 'bamboo-utensil-set', description: 'A reusable and portable set of bamboo utensils.', price: 15.99, stock: 200, category: 'Kitchen', brand: 'GreenLeaf',
                mainImage: 'https://picsum.photos/seed/bamboo1/800/600',
                images: ['https://picsum.photos/seed/bamboo1/800/600', 'https://picsum.photos/seed/bamboo2/800/600']
            },
            {
                _id: 'prod_beeswax_wraps', owner: 'store_eco_friendly', name: 'Beeswax Food Wraps', slug: 'beeswax-food-wraps', description: 'A natural alternative to plastic wrap.', price: 19.99, stock: 150, category: 'Kitchen', brand: 'GreenLeaf',
                mainImage: 'https://picsum.photos/seed/wrap1/800/600',
                images: ['https://picsum.photos/seed/wrap1/800/600', 'https://picsum.photos/seed/wrap2/800/600']
            },
        ],
    },
    {
        _id: 'store_minimalist_home',
        brandName: 'Simple Home',
        description: 'Simple Home is dedicated to the philosophy of minimalism. We offer thoughtfully designed home goods that are both beautiful and functional, helping you create a calm and uncluttered space.',
        themeId: 4,
        theme: { primaryColor: '#4b5563' },
        themeStructure: { header: true, hero: true, about: true, trust: true, productGrid: true, footer: true },
        headerLinks: [{ label: 'Living', href: '#' }, { label: 'Workspace', href: '#' }, { label: 'Journal', href: '#' }],
        hero: {
            title: 'Less, but better.',
            subtitle: 'Thoughtfully designed home goods that are both beautiful and functional, helping you create a calm space.',
            imageUrl: 'https://picsum.photos/seed/minimal_hero/1600/900',
        },
        about: {
            title: 'The Art of Simplicity',
            description: 'We believe your home should be a sanctuary. Our collection is curated to bring harmony and intention to your daily life, focusing on quality materials and timeless design over fleeting trends.',
        },
        footer: { text: 'Live Simply.' },
        socialLinks: { instagram: '#' },
        products: [
            {
                _id: 'prod_desk_organizer', owner: 'store_minimalist_home', name: 'Oak Desk Organizer', slug: 'oak-desk-organizer', description: 'Keep your workspace tidy with this elegant organizer.', price: 55.00, stock: 70, category: 'Office', brand: 'Simple Home',
                mainImage: 'https://picsum.photos/seed/desk1/800/600',
                images: ['https://picsum.photos/seed/desk1/800/600', 'https://picsum.photos/seed/desk2/800/600']
            },
             {
                _id: 'prod_linen_sheets', owner: 'store_minimalist_home', name: 'Linen Sheet Set', slug: 'linen-sheet-set', description: 'Experience comfort with 100% pure linen sheets.', price: 250.00, stock: 35, category: 'Bedding', brand: 'Simple Home',
                mainImage: 'https://picsum.photos/seed/linen1/800/600',
                images: ['https://picsum.photos/seed/linen1/800/600', 'https://picsum.photos/seed/linen2/800/600'],
                sizes: ['Twin', 'Queen', 'King']
            },
        ],
    },
    {
        _id: 'store_retro_vibes',
        brandName: 'Retro Rewind',
        description: 'Step back in time with Retro Rewind! We stock a curated selection of vintage-inspired apparel, classic games, and timeless decor that will transport you to a bygone era.',
        themeId: 5,
        theme: { primaryColor: '#db2777' },
        themeStructure: { header: true, hero: true, about: true, trust: false, productGrid: true, footer: true },
        headerLinks: [{ label: '80s', href: '#' }, { label: '90s', href: '#' }, { label: 'Arcade', href: '#' }],
        hero: {
            title: 'Nostalgia in Every Box.',
            subtitle: 'Vintage-inspired apparel, classic games, and timeless decor that will transport you to a bygone era.',
            imageUrl: 'https://picsum.photos/seed/retro_hero/1600/900',
        },
        about: {
            title: 'Good Times & Tan Lines',
            description: 'We\'re obsessed with the vibrant culture of the past. Retro Rewind is our love letter to the decades that shaped us, bringing you authentic styles and memories you can hold on to.',
        },
        footer: { text: 'Stay radical.' },
        socialLinks: { twitter: '#', instagram: '#' },
        products: [
            {
                _id: 'prod_cassette_player', owner: 'store_retro_vibes', name: 'Portable Cassette Player', slug: 'portable-cassette-player', description: 'Listen to your old mixtapes in style.', price: 39.99, stock: 100, category: 'Electronics', brand: 'Rewind',
                mainImage: 'https://picsum.photos/seed/cassette1/800/600',
                images: ['https://picsum.photos/seed/cassette1/800/600', 'https://picsum.photos/seed/cassette2/800/600']
            },
            {
                _id: 'prod_arcade_game', owner: 'store_retro_vibes', name: 'Mini Arcade Machine', slug: 'mini-arcade-machine', description: 'A mini arcade machine with 100+ classic games.', price: 89.50, stock: 45, category: 'Games', brand: 'Rewind',
                mainImage: 'https://picsum.photos/seed/arcade1/800/600',
                images: ['https://picsum.photos/seed/arcade1/800/600', 'https://picsum.photos/seed/arcade2/800/600']
            },
        ],
    },
];