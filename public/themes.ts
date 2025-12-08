export interface StoreThemeDefinition {
    name: string;
    category?: string;
    theme: {
        primaryColor: string;
        secondaryColor?: string;
        textColor?: string;
        surfaceColor?: string;
        gradient?: { from?: string; via?: string; to?: string };
    };
}

export const storeThemes: StoreThemeDefinition[] = [
    // 1. Electronics & Consumer Tech - Tech Blue with Circuit Patterns
    {
        name: "Tech Circuit",
        category: "Electronics & Consumer Tech",
        theme: {
        primaryColor: "#0ea5e9",
        secondaryColor: "#0369a1",
        textColor: "#f3f4f6",
        surfaceColor: "#c3e9fa",
        gradient: { from: "#0ea5e9", via: "#3b82f6", to: "#0369a1" },
        },
    },
    // 2. Fashion / Apparel & Footwear - Elegant Rose with Geometric Patterns
    {
        name: "Elegant Rose",
        category: "Fashion / Apparel & Footwear",
        theme: {
        primaryColor: "#f43f5e",
        secondaryColor: "#be123c",
        textColor: "#f3f4f6",
        surfaceColor: "#fccfd7",
        gradient: { from: "#fb7185", via: "#f472b6", to: "#be123c" },
        },
    },
    // 3. Beauty & Personal Care - Soft Lavender with Floral Patterns
    {
        name: "Lavender Dream",
        category: "Beauty & Personal Care",
        theme: {
        primaryColor: "#a78bfa",
        secondaryColor: "#7c3aed",
        textColor: "#f3f4f6",
        surfaceColor: "#e9e2fe",
        gradient: { from: "#c4b5fd", via: "#a78bfa", to: "#7c3aed" },
        },
    },
    // 4. Home & Garden / Furniture / Decor - Natural Green with Organic Patterns
    {
        name: "Natural Green",
        category: "Home & Garden / Furniture / Decor",
        theme: {
        primaryColor: "#aaa388",
        secondaryColor: "#aaa588",
        textColor: "#f3f4f6",
        surfaceColor: "#ffffff",
        gradient: { from: "#aaa388", via: "#aaa588", to: "#aaa588" },
        },
    },
    // 5. Mobile Accessories / Wearables / Smart Gadgets - Modern Cyan with Tech Patterns
    {
        name: "Modern Cyan",
        category: "Mobile Accessories / Wearables / Smart Gadgets",
        theme: {
        primaryColor: "#06b6d4",
        secondaryColor: "#0891b2",
        textColor: "#f3f4f6",
        surfaceColor: "#c1edf4",
        gradient: { from: "#22d3ee", via: "#06b6d4", to: "#0891b2" },
        },
    },
    // 6. Traditional / Handicraft / Local Crafts & Textiles - Warm Amber with Cultural Patterns
    {
        name: "Warm Amber",
        category: "Traditional / Handicraft / Local Crafts & Textiles",
        theme: {
        primaryColor: "#f59e0b",
        secondaryColor: "#b45309",
        textColor: "#f3f4f6",
        surfaceColor: "#fde7c2",
        gradient: { from: "#fbbf24", via: "#fcd34d", to: "#b45309" },
        },
    },
    // 7. Food & Drink / Grocery / Perishables - Fresh Orange with Organic Patterns
    {
        name: "Fresh Orange",
        category: "Food & Drink / Grocery / Perishables",
        theme: {
        primaryColor: "#814316ff",
        secondaryColor: "#a8632aff",
        textColor: "#f3f4f6",
        surfaceColor: "#ffffffff",
        gradient: { from: "#fdba74", via: "#fb923c", to: "#ea580c" },
        },
    },
    // 8. Toys / Games / Kids Products - Playful Pink with Fun Patterns
    {
        name: "Playful Pink",
        category: "Toys / Games / Kids Products",
        theme: {
        primaryColor: "#ec4899",
        secondaryColor: "#be185d",
        textColor: "#f3f4f6",
        surfaceColor: "#fad1e6",
        gradient: { from: "#f9a8d4", via: "#f472b6", to: "#be185d" },
        },
    },
    // 9. Health & Wellness / Personal Health Products - Clean Teal with Wellness Patterns
    {
        name: "Clean Teal",
        category: "Health & Wellness / Personal Health Products",
        theme: {
        primaryColor: "#14b8a6",
        secondaryColor: "#0d9488",
        textColor: "#f3f4f6",
        surfaceColor: "#c4ede9",
        gradient: { from: "#5eead4", via: "#2dd4bf", to: "#0d9488" },
        },
    },
    // 10. Computers / Laptops / Peripherals - Professional Indigo with Tech Patterns
    {
        name: "Professional Indigo",
        category: "Computers / Laptops / Peripherals",
        theme: {
        primaryColor: "#6366f1",
        secondaryColor: "#4338ca",
        textColor: "#f3f4f6",
        surfaceColor: "#d8d9fc",
        gradient: { from: "#818cf8", via: "#6366f1", to: "#4338ca" },
        },
    },
    // 11. Midnight Indigo
    {
        name: "Midnight Indigo",
        theme: {
        primaryColor: "#4338ca",
        secondaryColor: "#312e81",
        textColor: "#f3f4f6",
        surfaceColor: "#d0cdf2",
        gradient: { from: "#6366f1", via: "#818cf8", to: "#312e81" },
        
        },
    },
    // 12. Cyber Neon
    {
        name: "Cyber Neon",
        theme: {
        primaryColor: "#06b6d4",
        secondaryColor: "#0ea5e9",
        textColor: "#f8fafc",
        surfaceColor: "#c1edf4",
        gradient: { from: "#22d3ee", via: "#06b6d4", to: "#0ea5e9" },
        },
    },
    // 13. Desert Sand
    {
        name: "Desert Sand",
        theme: {
        primaryColor: "#f59e0b",
        secondaryColor: "#b45309",
        textColor: "#f3f4f6",
        surfaceColor: "#fde7c2",
        gradient: { from: "#fbbf24", via: "#fcd34d", to: "#b45309" },
        },
    },
    // 14. Frost Mint
    {
        name: "Frost Mint",
        theme: {
        primaryColor: "#34d399",
        secondaryColor: "#059669",
        textColor: "#065f46",
        surfaceColor: "#ccf4e6",
        gradient: { from: "#6ee7b7", via: "#34d399", to: "#059669" },
        },
    },
    // 15. Lavender Dream
    {
        name: "Lavender Dream",
        theme: {
        primaryColor: "#a78bfa",
        secondaryColor: "#7c3aed",
        textColor: "#312e81",
        surfaceColor: "#e9e2fe",
        gradient: { from: "#c4b5fd", via: "#a78bfa", to: "#7c3aed" },
        },
    },
    // 16. Graphite Dark
    {
        name: "Graphite Dark",
        theme: {
        primaryColor: "#6b7280",
        secondaryColor: "#374151",
        textColor: "#f3f4f6",
        surfaceColor: "#dadcdf",
        gradient: { from: "#9ca3af", via: "#6b7280", to: "#374151" },
        },
    },
    ];
