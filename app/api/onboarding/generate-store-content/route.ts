import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { generateStoreContent } from "@/lib/agent/storeAgent/storeAgent";

/**
 * POST /api/onboarding/generate-store-content
 * - Uses Mistral AI (storeAgent) to generate hero, about, and footer content for stores
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { brandName, description, language } = await request.json();

        if (!brandName || !description) {
            return NextResponse.json({ 
                error: "Brand name and description are required" 
            }, { status: 400 });
        }

        // ✅ Use Mistral agent to generate content in user's language
        const storeLanguage = language || 'en';
        const generatedContent = await generateStoreContent(brandName, description, storeLanguage);

        // Format brand name for social links
        const formatBrandName = (name: string): string => {
            return name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        };

        const formattedBrand = formatBrandName(brandName);

        // Generate header links (localized based on language)
        const headerLinksMap: Record<string, Array<{ label: string; href: string }>> = {
            'en': [
                { label: "Home", href: "/" },
                { label: "Products", href: "#products" },
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
            ],
            'fr': [
                { label: "Accueil", href: "/" },
                { label: "Produits", href: "#products" },
                { label: "À propos", href: "#about" },
                { label: "Contact", href: "#contact" },
            ],
            'ar': [
                { label: "الرئيسية", href: "/" },
                { label: "المنتجات", href: "#products" },
                { label: "من نحن", href: "#about" },
                { label: "اتصل بنا", href: "#contact" },
            ],
        };
        const headerLinks = headerLinksMap[storeLanguage] || headerLinksMap['en'];

        // Generate social links (using TikTok as per store model)
        const socialLinks = {
            facebook: `https://www.facebook.com/${formattedBrand}`,
            instagram: `https://www.instagram.com/${formattedBrand}`,
            tiktok: `https://www.tiktok.com/@${formattedBrand}`,
        };

        // Combine all generated content
        const storeData = {
            brandName,
            description: generatedContent.about.description, // Use expanded description
            hero: generatedContent.hero,
            about: generatedContent.about,
            footer: generatedContent.footer,
            headerLinks,
            socialLinks,
        };

        return NextResponse.json({
            success: true,
            storeData,
        });

    } catch (error: any) {
        console.error("Error generating store content:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate store content" },
            { status: 500 }
        );
    }
}

