import ProductPageClientWrapper from '@/components/pages/productWraper';
import { getProductWithStoreBySlug } from '@/lib/data/products';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';
import ThemeInjector from '@/components/productPage/ThemeInjector';
import { getStoreByDomain } from '@/lib/data/store';
import NotFound from './not-found';
import { headers } from "next/headers";
import { getSubdomainFromHeaders } from '@/lib/utils/subdomain';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    // Get subdomain from headers (this route is only used for subdomain routing)
    const subdomain = await getSubdomainFromHeaders(headers);
    
    if (!subdomain) {
        return <NotFound/>;
    }
    
    // Normalize domain
    const storeDomain = subdomain.toLowerCase().trim();
    
    // Get product and store
    const { product, store } = await getProductWithStoreBySlug(slug);
    
    if (!product) {
        return <NotFound/>;
    }
    
    // Verify the product belongs to the store from subdomain
    if (store && store.domain !== storeDomain) {
        return <NotFound/>;
    }
    
    if (!store) {
        return <NotFound/>;
    }
    
    return (
        <>
            <ThemeInjector theme={store.theme || {}} />
            <ProductPageClientWrapper product={product} store={store} />
        </>
    );
}

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return generateProductMetadata(slug);
}

// Optional: viewport theme
export async function generateViewport() {
    const subdomain = await getSubdomainFromHeaders(headers);
    if (subdomain) {
        const store = await getStoreByDomain(subdomain.toLowerCase().trim());
        return { themeColor: store?.theme };
    }
    return { themeColor: undefined };
}

export const revalidate = 60;

