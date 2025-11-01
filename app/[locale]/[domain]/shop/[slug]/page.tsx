

import ProductPageClientWrapper from '@/components/pages/productWraper';
import { getProductWithStoreBySlug } from '@/lib/data/products';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';
import ThemeInjector from '@/components/productPage/ThemeInjector';

import { getStoreByDomain } from '@/lib/data/store';
import NotFound from '../not-found';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { product, store } = await getProductWithStoreBySlug(slug);

    if (!product) {
        return <NotFound/>;
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
export async function generateViewport({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const store = await getStoreByDomain(domain);
    return { themeColor: store?.theme };
}

export const revalidate = 60;
