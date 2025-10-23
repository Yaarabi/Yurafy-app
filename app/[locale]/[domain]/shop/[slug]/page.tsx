

import ProductGallery from '@/components/productPage/ProductGallery';
import ProductDetails from '@/components/productPage/ProductDetails';
import ProductVariantsUI from '@/components/productPage/ProductVariantsUI';
import OrderForm from '@/components/productPage/orderForm';
import WhatsAppButton from '@/components/productPage/ProductActions';
import { getProductWithStoreBySlug } from '@/lib/data/products';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';
import ThemeInjector from '@/components/productPage/ThemeInjector';
import TrustSection from '@/components/store/TrustInAs';
import ProductHeader from '@/components/store/Header';
import { getStoreByDomain } from '@/lib/data/store';


export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { product, store } = await getProductWithStoreBySlug(slug);

    if (!product) {
        return <p className="text-center text-gray-400 mt-10 animate-pulse">Produit introuvable.</p>;
    }

    const theme = store?.theme || {};

    return (
        <>
            <ThemeInjector theme={theme} />
            {store && <ProductHeader store={store} />}
            <main className="relative min-h-screen px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <section className="max-w-6xl mx-auto flex flex-col gap-10 p-6 md:p-12 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm">
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
                        </div>
                    </div>
                </section>
            </main>
            <TrustSection/>

            <WhatsAppButton />
        </>
    );
}

// ----------------------
// SEO Metadata
// ----------------------
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return generateProductMetadata(slug);
}

export async function generateViewport({ params }: { params: { domain: string } }) {
    const { domain } = await params;
    const store = await getStoreByDomain(domain);
    return { themeColor: store?.theme };
}

export const revalidate = 60;
