

import ProductPageClientWrapper from '@/components/pages/productWraper';
import { getProductWithStoreBySlug } from '@/lib/data/products';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';
import ThemeInjector from '@/components/productPage/ThemeInjector';
import { getStoreByDomain } from '@/lib/data/store';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { product, store } = await getProductWithStoreBySlug(slug);

    if (!product) {
        return <p className="text-center text-gray-400 mt-10 animate-pulse">Produit introuvable.</p>;
    }

    return (
        <>
            <ThemeInjector theme={store?.theme || {}} />
            <ProductPageClientWrapper product={product} store={store} />
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

// Optional: viewport theme
export async function generateViewport({ params }: { params: { domain: string } }) {
    const { domain } = await params;
    const store = await getStoreByDomain(domain);
    return { themeColor: store?.theme };
}

export const revalidate = 60;
