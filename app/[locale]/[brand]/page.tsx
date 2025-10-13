import WhatsAppButton from '@/components/shop/productPage/ProductActions';
import ProductHeader from '@/components/shop/productPage/ProductHeader';
import { getOwnerByBrand } from '@/lib/data/owner';
import { generateOwnerMetadata } from '@/lib/metadata/ownerMetadata';
import OwnerProductsGrid from '@/components/shop/productPage/OwnerProductsGrid';
import TrustBanner from '@/components/shop/productPage/TrustBanner';
import OfferBar from '@/components/shop/productPage/OfferBar';
import LandingFooter from '@/components/shop/productPage/footerOwner';

export default async function UserStorePage({ params }: { params: Promise<{ brand: string }> }) {
    const { brand } = await params;

    const owner = await getOwnerByBrand(brand);

    if (!owner) {
        return (
        <p className="text-center text-gray-400 mt-10 animate-pulse">
            Store Not Found
        </p>
        );
    }

    return (
        <>
        <OfferBar />
        <ProductHeader owner={owner} />

        <main className="relative min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <OwnerProductsGrid ownerId={owner._id} />
            <TrustBanner />
            
        </main>

        <WhatsAppButton productName={owner.brandName || owner.name} />
        <LandingFooter owner={owner} />
        </>
    );
}

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
    const { brand } = await params;
    return generateOwnerMetadata(brand);
}

// Revalidate every minute
export const revalidate = 60;
