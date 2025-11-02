import { SerializedStore } from '@/lib/data/store';

export interface ThemePreview {
    themeId: number;
    name: string;
    description: string;
    preview: Partial<SerializedStore>;
    features: string[];
}

export const THEME_PREVIEWS: ThemePreview[] = [
    {
        themeId: 1,
        name: 'Tech Innovation',
        description: 'Modern tech-focused design with bold gradients and sleek layouts',
        preview: {
            brandName: 'Tech Store',
            theme: { primaryColor: '#0891b2', secondaryColor: '#0e7490', textColor: '#ffffff' },
            hero: {
                title: 'Experience Tomorrow',
                subtitle: 'Cutting-edge technology for modern life',
                imageUrl: 'https://picsum.photos/seed/tech/800/600',
            },
            about: {
                title: 'Pioneering Innovation',
                description: 'We bring you the latest innovations that blend seamlessly into your life.',
            },
        },
        features: ['Gradient Hero', 'Card Layout', 'Modern Navigation', 'Tech Aesthetic'],
    },
    {
        themeId: 2,
        name: 'Artisan Craft',
        description: 'Warm, handcrafted feel with elegant typography and organic shapes',
        preview: {
            brandName: 'Artisan Goods',
            theme: { primaryColor: '#ca8a04', secondaryColor: '#a16207', textColor: '#ffffff' },
            hero: {
                title: 'Handcrafted with Passion',
                subtitle: 'Discover unique goods from makers around the world',
                imageUrl: 'https://picsum.photos/seed/artisan/800/600',
            },
            about: {
                title: 'The Hands Behind the Craft',
                description: 'Every item tells a story of tradition and quality.',
            },
        },
        features: ['Elegant Typography', 'Warm Colors', 'Organic Shapes', 'Artisan Feel'],
    },
    {
        themeId: 3,
        name: 'Eco Green',
        description: 'Sustainable design with nature-inspired elements and green accents',
        preview: {
            brandName: 'Green Living',
            theme: { primaryColor: '#16a34a', secondaryColor: '#15803d', textColor: '#ffffff' },
            hero: {
                title: 'Sustainable Choices',
                subtitle: 'Eco-friendly products that are good for you and the Earth',
                imageUrl: 'https://picsum.photos/seed/eco/800/600',
            },
            about: {
                title: 'Live Green, Live Better',
                description: 'Making sustainable living easy and accessible.',
            },
        },
        features: ['Eco Badges', 'Nature Colors', 'Sustainable Layout', 'Green Aesthetic'],
    },
    {
        themeId: 4,
        name: 'Minimal Elegance',
        description: 'Clean, minimal design with large typography and lots of whitespace',
        preview: {
            brandName: 'Simple Home',
            theme: { primaryColor: '#4b5563', secondaryColor: '#374151', textColor: '#ffffff' },
            hero: {
                title: 'Less, but better.',
                subtitle: 'Thoughtfully designed goods for a calm space',
                imageUrl: 'https://picsum.photos/seed/minimal/800/600',
            },
            about: {
                title: 'The Art of Simplicity',
                description: 'Focusing on quality materials and timeless design.',
            },
        },
        features: ['Large Typography', 'Clean Layout', 'Minimal Borders', 'Elegant Design'],
    },
    {
        themeId: 5,
        name: 'Retro Vibes',
        description: 'Bold, nostalgic design with vibrant colors and retro patterns',
        preview: {
            brandName: 'Retro Rewind',
            theme: { primaryColor: '#db2777', secondaryColor: '#be185d', textColor: '#ffffff' },
            hero: {
                title: 'Nostalgia in Every Box',
                subtitle: 'Vintage-inspired goods that transport you to a bygone era',
                imageUrl: 'https://picsum.photos/seed/retro/800/600',
            },
            about: {
                title: 'Good Times & Tan Lines',
                description: 'Our love letter to the decades that shaped us.',
            },
        },
        features: ['Bold Colors', 'Retro Patterns', 'Vibrant Layout', 'Nostalgic Design'],
    },
    {
        themeId: 6,
        name: 'Modern Cards',
        description: 'Contemporary card-based layout with glassmorphism effects',
        preview: {
            brandName: 'Modern Store',
            theme: { primaryColor: '#3B82F6', secondaryColor: '#2563eb', textColor: '#ffffff' },
            hero: {
                title: 'Modern Shopping Experience',
                subtitle: 'Contemporary design meets functionality',
                imageUrl: 'https://picsum.photos/seed/modern/800/600',
            },
            about: {
                title: 'About Our Brand',
                description: 'We combine modern design with exceptional products.',
            },
        },
        features: ['Glassmorphism', 'Card Design', 'Modern Gradients', 'Clean UI'],
    },
    {
        themeId: 7,
        name: 'Masonry Grid',
        description: 'Pinterest-style masonry layout with full-width hero',
        preview: {
            brandName: 'Grid Store',
            theme: { primaryColor: '#8B5CF6', secondaryColor: '#7c3aed', textColor: '#ffffff' },
            hero: {
                title: 'Discover Our Collection',
                subtitle: 'A visual journey through our products',
                imageUrl: 'https://picsum.photos/seed/masonry/800/600',
            },
            about: {
                title: 'About Our Brand',
                description: 'Every product tells a unique story.',
            },
        },
        features: ['Masonry Layout', 'Full-Width Hero', 'Visual Focus', 'Modern Grid'],
    },
    {
        themeId: 8,
        name: 'Split Screen',
        description: 'Alternating split-screen sections with dynamic layouts',
        preview: {
            brandName: 'Split Design',
            theme: { primaryColor: '#EC4899', secondaryColor: '#db2777', textColor: '#ffffff' },
            hero: {
                title: 'Split Screen Experience',
                subtitle: 'Dynamic layouts that engage and inspire',
                imageUrl: 'https://picsum.photos/seed/split/800/600',
            },
            about: {
                title: 'About Our Brand',
                description: 'We create engaging shopping experiences.',
            },
        },
        features: ['Split Layout', 'Alternating Sections', 'Dynamic Design', 'Engaging UI'],
    },
    {
        themeId: 9,
        name: 'Minimalist Stack',
        description: 'Ultra-minimal design with large typography and vertical stacking',
        preview: {
            brandName: 'Minimal Store',
            theme: { primaryColor: '#1F2937', secondaryColor: '#111827', textColor: '#ffffff' },
            hero: {
                title: 'Minimal. Essential.',
                subtitle: 'Less is more in modern design',
                imageUrl: 'https://picsum.photos/seed/minimalist/800/600',
            },
            about: {
                title: 'About Our Brand',
                description: 'Simplicity at its finest.',
            },
        },
        features: ['Large Typography', 'Vertical Stack', 'Ultra-Minimal', 'Clean Design'],
    },
    {
        themeId: 10,
        name: 'Bold Magazine',
        description: 'Asymmetric magazine-style layout with bold typography',
        preview: {
            brandName: 'Magazine Store',
            theme: { primaryColor: '#F59E0B', secondaryColor: '#d97706', textColor: '#ffffff' },
            hero: {
                title: 'Bold Statements',
                subtitle: 'Asymmetric layouts that demand attention',
                imageUrl: 'https://picsum.photos/seed/magazine/800/600',
            },
            about: {
                title: 'About Our Brand',
                description: 'We make bold design choices.',
            },
        },
        features: ['Asymmetric Grid', 'Bold Typography', 'Magazine Style', 'Dynamic Layout'],
    },
];

// Shows preview stores for each theme (1-10) like Shopify theme marketplace

export interface ThemePreview {
    themeId: number;
    name: string;
    description: string;
    category: string;
    previewImage: string;
    theme: {
        primaryColor: string;
        secondaryColor?: string;
        textColor?: string;
    };
    demoStore: {
        brandName: string;
        hero: {
            title: string;
            subtitle: string;
        };
        products: Array<{
            name: string;
            price: number;
            image: string;
        }>;
    };
}

export const themePreviews: ThemePreview[] = [
    {
        themeId: 1,
        name: "Tech Modern",
        description: "Perfect for tech and electronics stores. Clean, professional design with modern aesthetics.",
        category: "Technology",
        previewImage: "https://picsum.photos/seed/theme1/800/600",
        theme: { primaryColor: "#0891b2", secondaryColor: "#06b6d4", textColor: "#ffffff" },
        demoStore: {
            brandName: "Future Gadgets",
            hero: {
                title: "Experience Tomorrow, Today.",
                subtitle: "Cutting-edge technology for modern life."
            },
            products: [
                { name: "Smart Watch", price: 249.99, image: "https://picsum.photos/seed/product1/400/400" },
                { name: "Wireless Earbuds", price: 129.99, image: "https://picsum.photos/seed/product2/400/400" },
                { name: "Tablet Pro", price: 599.99, image: "https://picsum.photos/seed/product3/400/400" },
            ]
        }
    },
    {
        themeId: 2,
        name: "Artisan Handmade",
        description: "Ideal for handmade crafts and artisanal products. Warm, inviting design with classic touches.",
        category: "Crafts & Handmade",
        previewImage: "https://picsum.photos/seed/theme2/800/600",
        theme: { primaryColor: "#ca8a04", secondaryColor: "#eab308", textColor: "#ffffff" },
        demoStore: {
            brandName: "The Artisan Mill",
            hero: {
                title: "Handcrafted with Passion.",
                subtitle: "Discover unique goods from makers around the world."
            },
            products: [
                { name: "Leather Journal", price: 45.00, image: "https://picsum.photos/seed/product4/400/400" },
                { name: "Ceramic Mug", price: 28.00, image: "https://picsum.photos/seed/product5/400/400" },
                { name: "Wool Blanket", price: 120.00, image: "https://picsum.photos/seed/product6/400/400" },
            ]
        }
    },
    {
        themeId: 3,
        name: "Eco Green",
        description: "Perfect for eco-friendly and sustainable brands. Fresh, natural design with green accents.",
        category: "Eco & Sustainable",
        previewImage: "https://picsum.photos/seed/theme3/800/600",
        theme: { primaryColor: "#16a34a", secondaryColor: "#22c55e", textColor: "#ffffff" },
        demoStore: {
            brandName: "GreenLeaf Living",
            hero: {
                title: "Sustainable Choices for a Better Planet.",
                subtitle: "Eco-friendly products that are good for you and the Earth."
            },
            products: [
                { name: "Bamboo Utensils", price: 15.99, image: "https://picsum.photos/seed/product7/400/400" },
                { name: "Beeswax Wraps", price: 19.99, image: "https://picsum.photos/seed/product8/400/400" },
                { name: "Reusable Bottle", price: 24.99, image: "https://picsum.photos/seed/product9/400/400" },
            ]
        }
    },
    {
        themeId: 4,
        name: "Minimalist",
        description: "Clean, minimal design perfect for modern brands. Focus on simplicity and elegance.",
        category: "Minimalist",
        previewImage: "https://picsum.photos/seed/theme4/800/600",
        theme: { primaryColor: "#4b5563", secondaryColor: "#6b7280", textColor: "#ffffff" },
        demoStore: {
            brandName: "Simple Home",
            hero: {
                title: "Less, but better.",
                subtitle: "Thoughtfully designed home goods for modern living."
            },
            products: [
                { name: "Desk Organizer", price: 55.00, image: "https://picsum.photos/seed/product10/400/400" },
                { name: "Linen Sheets", price: 250.00, image: "https://picsum.photos/seed/product11/400/400" },
                { name: "Wooden Planter", price: 35.00, image: "https://picsum.photos/seed/product12/400/400" },
            ]
        }
    },
    {
        themeId: 5,
        name: "Retro Vibes",
        description: "Nostalgic design for vintage-inspired brands. Bold colors and retro aesthetics.",
        category: "Vintage & Retro",
        previewImage: "https://picsum.photos/seed/theme5/800/600",
        theme: { primaryColor: "#db2777", secondaryColor: "#ec4899", textColor: "#ffffff" },
        demoStore: {
            brandName: "Retro Rewind",
            hero: {
                title: "Nostalgia in Every Box.",
                subtitle: "Vintage-inspired products that take you back in time."
            },
            products: [
                { name: "Cassette Player", price: 39.99, image: "https://picsum.photos/seed/product13/400/400" },
                { name: "Arcade Machine", price: 89.50, image: "https://picsum.photos/seed/product14/400/400" },
                { name: "Retro T-Shirt", price: 24.99, image: "https://picsum.photos/seed/product15/400/400" },
            ]
        }
    },
    {
        themeId: 6,
        name: "Modern Card",
        description: "Card-based layout with modern styling. Perfect for fashion and lifestyle brands.",
        category: "Modern & Fashion",
        previewImage: "https://picsum.photos/seed/theme6/800/600",
        theme: { primaryColor: "#3B82F6", secondaryColor: "#2563eb", textColor: "#ffffff" },
        demoStore: {
            brandName: "Style Studio",
            hero: {
                title: "Discover Your Style.",
                subtitle: "Trendy fashion pieces for every occasion."
            },
            products: [
                { name: "Designer Jacket", price: 199.99, image: "https://picsum.photos/seed/product16/400/400" },
                { name: "Leather Boots", price: 149.99, image: "https://picsum.photos/seed/product17/400/400" },
                { name: "Designer Bag", price: 299.99, image: "https://picsum.photos/seed/product18/400/400" },
            ]
        }
    },
    {
        themeId: 7,
        name: "Masonry Grid",
        description: "Pinterest-style masonry layout. Great for showcasing products with varied aspect ratios.",
        category: "Creative & Art",
        previewImage: "https://picsum.photos/seed/theme7/800/600",
        theme: { primaryColor: "#8B5CF6", secondaryColor: "#7c3aed", textColor: "#ffffff" },
        demoStore: {
            brandName: "Creative Gallery",
            hero: {
                title: "Explore Creative Products.",
                subtitle: "Unique designs that inspire your creativity."
            },
            products: [
                { name: "Art Print", price: 49.99, image: "https://picsum.photos/seed/product19/400/400" },
                { name: "Camera Lens", price: 399.99, image: "https://picsum.photos/seed/product20/400/400" },
                { name: "Sketchbook", price: 19.99, image: "https://picsum.photos/seed/product21/400/400" },
            ]
        }
    },
    {
        themeId: 8,
        name: "Split Screen",
        description: "Modern split-screen design. Perfect for tech and innovative brands.",
        category: "Innovation & Tech",
        previewImage: "https://picsum.photos/seed/theme8/800/600",
        theme: { primaryColor: "#EC4899", secondaryColor: "#f43f5e", textColor: "#ffffff" },
        demoStore: {
            brandName: "Innovate Co",
            hero: {
                title: "Innovation Meets Style.",
                subtitle: "Cutting-edge products for the modern lifestyle."
            },
            products: [
                { name: "Smart Speaker", price: 179.99, image: "https://picsum.photos/seed/product22/400/400" },
                { name: "LED Strip", price: 29.99, image: "https://picsum.photos/seed/product23/400/400" },
                { name: "Robot Vacuum", price: 349.99, image: "https://picsum.photos/seed/product24/400/400" },
            ]
        }
    },
    {
        themeId: 9,
        name: "Minimalist Stack",
        description: "Ultra-minimal design with large typography. Perfect for premium brands.",
        category: "Premium & Luxury",
        previewImage: "https://picsum.photos/seed/theme9/800/600",
        theme: { primaryColor: "#1F2937", secondaryColor: "#374151", textColor: "#ffffff" },
        demoStore: {
            brandName: "Elegant Store",
            hero: {
                title: "Elegance Redefined.",
                subtitle: "Premium products with minimalist design."
            },
            products: [
                { name: "Premium Watch", price: 899.99, image: "https://picsum.photos/seed/product25/400/400" },
                { name: "Leather Wallet", price: 149.99, image: "https://picsum.photos/seed/product26/400/400" },
                { name: "Sunglasses", price: 199.99, image: "https://picsum.photos/seed/product27/400/400" },
            ]
        }
    },
    {
        themeId: 10,
        name: "Bold Magazine",
        description: "Bold, asymmetric design. Perfect for creative and artistic brands.",
        category: "Creative & Bold",
        previewImage: "https://picsum.photos/seed/theme10/800/600",
        theme: { primaryColor: "#F59E0B", secondaryColor: "#d97706", textColor: "#ffffff" },
        demoStore: {
            brandName: "Bold Brand",
            hero: {
                title: "Make a Statement.",
                subtitle: "Bold products for bold individuals."
            },
            products: [
                { name: "Statement Tee", price: 34.99, image: "https://picsum.photos/seed/product28/400/400" },
                { name: "Canvas Print", price: 79.99, image: "https://picsum.photos/seed/product29/400/400" },
                { name: "Designer Shoes", price: 179.99, image: "https://picsum.photos/seed/product30/400/400" },
            ]
        }
    },
];

