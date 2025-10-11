
import ProductGallery from '@/components/shop/productPage/ProductGallery';
import ProductDetails from '@/components/shop/productPage/ProductDetails';
import ProductVariantsUI from '@/components/shop/productPage/ProductVariantsUI';
import OrderForm from '@/components/shop/productPage/orderForm';
import WhatsAppButton from '@/components/shop/productPage/ProductActions';
import ProductHeader from '@/components/shop/productPage/ProductHeader';
import { getProductWithOwnerBySlug } from '@/lib/data/products';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';
import OwnerProductsGrid from '@/components/shop/productPage/OwnerProductsGrid';
import TrustBanner from '@/components/shop/productPage/TrustBanner';
import OfferBar from '@/components/shop/productPage/OfferBar';
import LandingFooter from '@/components/shop/productPage/footerOwner';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { product, owner } = await getProductWithOwnerBySlug(slug);

    if (!product) {
        return (
        <p className="text-center text-gray-400 mt-10 animate-pulse">
            Not Found
        </p>
        );
    }

    return (
        <>
        <OfferBar />
        {owner ? <ProductHeader owner={owner} /> : null}

        <main className="relative min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="max-w-6xl mx-auto flex flex-col gap-10 p-6 md:p-12 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row gap-10">
                <ProductGallery mainImage={product.mainImage} images={product.images} alt={product.name} />

                <div className="flex-1 flex flex-col justify-between">
                <ProductDetails product={product} />
                <ProductVariantsUI sizes={product.sizes} colors={product.colors} />
                <OrderForm product={product} />
                </div>
            </div>
            <TrustBanner />

            </div>
        </main>

        <WhatsAppButton productName={product.name} />
        {owner && <LandingFooter owner={owner} />}
        </>
    );
}

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return generateProductMetadata(slug);
}

// Optional ISR
export const revalidate = 60;
