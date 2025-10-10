import ProductGallery from '@/components/shop/productPage/ProductGallery';
import ProductDetails from '@/components/shop/productPage/ProductDetails';
import ProductVariantsUI from '@/components/shop/productPage/ProductVariantsUI';
import OrderForm from '@/components/shop/productPage/orderForm';
import WhatsAppButton from '@/components/shop/productPage/ProductActions';
import ProductHeader from '@/components/shop/productPage/ProductHeader';
import Header from '@/components/shop/Header';
import { getTranslations } from 'next-intl/server';
import { getProductWithOwnerBySlug } from '@/lib/data/products';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';
import OwnerProductsGrid from '@/components/shop/productPage/OwnerProductsGrid';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }>}) {
    const t = await getTranslations('product');
    const paramsResolved = (await params).slug;
    const { product, owner } = await getProductWithOwnerBySlug(paramsResolved);

    if (!product) {
        return (
        <p className="text-center text-gray-400 mt-10 animate-pulse">
            {t('notFound')}
        </p>
        );
    }

    return (
        <>
        {owner ? <ProductHeader owner={owner} /> : <Header />}
        <main className="relative min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-cyan-50 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="max-w-6xl mx-auto flex flex-col gap-10 p-6 md:p-12">
            <div className="flex flex-col md:flex-row gap-10">
                <ProductGallery
                mainImage={product.mainImage}
                images={product.images}
                alt={product.name}
                />

                <div className="flex-1 flex flex-col justify-between">
                <ProductDetails product={product} />
                <ProductVariantsUI sizes={product.sizes} colors={product.colors} />
                <OrderForm product={product} />
                <WhatsAppButton productName={product.name} />
                </div>
            </div>
            {owner && <OwnerProductsGrid ownerId={owner._id} excludeId={product._id} />}
            </div>
        </main>
        </>
    );
}

// SEO Metadata
export async function generateMetadata({ params }: { params: { slug: string } }) {
    return generateProductMetadata(params.slug, );
}

// Optional ISR for better performance
export const revalidate = 60; // revalidate every 60 seconds
