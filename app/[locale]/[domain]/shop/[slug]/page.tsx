import ProductPageClientWrapper from '@/components/pages/productWraper';
import { getProductWithStoreBySlug } from '@/lib/data/products';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';
import ThemeInjector from '@/components/productPage/ThemeInjector';
import { getStoreByDomain } from '@/lib/data/store';
import NotFound from '../not-found';
import { headers } from "next/headers";
import { getSubdomainFromHeaders } from '@/lib/utils/subdomain';

export default async function ProductPage({ params }: { params: Promise<{ slug: string; domain?: string; locale?: string }> }) {
    const { slug, domain } = await params;
    
    // Extract actual store domain - prioritize subdomain from headers if available
    let storeDomain = domain;
    const subdomain = await getSubdomainFromHeaders(headers);
    
    // If we have a subdomain from headers, use it (subdomain takes precedence)
    // Otherwise, use the domain from params (path-based routing)
    if (subdomain) {
        storeDomain = subdomain;
    }
    
    // Normalize domain (lowercase, trim) if we have it
    if (storeDomain) {
        storeDomain = storeDomain.toLowerCase().trim();
    }
    
    const { product, store } = await getProductWithStoreBySlug(slug);

    if (!product) {
        return <NotFound/>;
    }
    
    // If we have a store domain and it doesn't match the product's store, return not found
    if (storeDomain && store && store.domain !== storeDomain) {
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
export async function generateViewport({ params }: { params: Promise<{ domain?: string }> }) {
    const { domain } = await params;
    
    // Extract actual store domain (handle subdomain case)
    let storeDomain = domain;
    const subdomain = await getSubdomainFromHeaders(headers);
    if (subdomain) {
        storeDomain = subdomain;
    }
    
    if (storeDomain) {
        const store = await getStoreByDomain(storeDomain);
        return { themeColor: store?.theme };
    }
    
    return { themeColor: undefined };
}

export const revalidate = 60;
