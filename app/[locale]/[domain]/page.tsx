import { getStoreByDomain } from "@/lib/data/store";
import { generateStoreMetadata } from "@/lib/metadata/storeMetadata";

import ProductHeader from "@/components/shop/productPage/ProductHeader";
import WhatsAppButton from "@/components/shop/productPage/ProductActions";
import OwnerProductsGrid from "@/components/shop/productPage/OwnerProductsGrid";
import TrustBanner from "@/components/shop/productPage/TrustBanner";
import OfferBar from "@/components/shop/productPage/OfferBar";
import LandingFooter from "@/components/shop/productPage/footerOwner";
import Hero from "@/components/shop/HeroSection";
import WhoWeAre from "@/components/shop/WhoWeAre";
import ThemeInjector from "@/components/shop/ThemeInjector";

export default async function UserStorePage({ params }: { params: { domain: string } }) {
    const { domain } = await params;

    const store = await getStoreByDomain(domain);

    if (!store) {
        return (
            <p className="text-center text-gray-400 mt-10 animate-pulse">
                Store Not Found
            </p>
        );
    }

    return (
        <>
            <ThemeInjector theme={store.theme} />

            <OfferBar />
            <ProductHeader store={store} />
            <Hero store={store} />

            <main className="relative min-h-screen px-4 sm:px-6 lg:px-8 py-12 md:py-20 bg-[var(--background-color)]">
                <OwnerProductsGrid ownerId={store.owner!} />
                <WhoWeAre store={store} />
                <TrustBanner />
            </main>

            <WhatsAppButton productName={store.brandName} />
            <LandingFooter store={store} />
        </>
    );
}

// SEO Metadata
export async function generateMetadata({ params }: { params: { domain: string } }) {
    const { domain } = await params;
    return generateStoreMetadata(domain);
}

// Viewport Metadata (for themeColor)
export async function generateViewport({ params }: { params: { domain: string } }) {
    const { domain } = await params;
    const store = await getStoreByDomain(domain);
    return {
        themeColor: store?.theme?.primaryColor || "#22c55e",
    };
}

// Revalidate every minute
export const revalidate = 60;
