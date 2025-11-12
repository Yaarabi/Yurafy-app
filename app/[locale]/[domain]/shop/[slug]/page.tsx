import ProductPageClientWrapper from '@/components/pages/productWraper';
import { getProductWithStoreBySlug } from '@/lib/data/products';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';
import ThemeInjector from '@/components/productPage/ThemeInjector';
import { getStoreByDomain } from '@/lib/data/store';
import NotFound from '../not-found';
import { headers } from "next/headers";
import { getSubdomainFromHeaders } from '@/lib/utils/subdomain';

export default async function ProductPage({ params }: { params: Promise<{ slug: string; domain?: string; locale?: string }> }) {
    const { slug, domain, locale = 'en' } = await params;
    
    // Extract actual store domain - prioritize subdomain from headers if available
    let storeDomain = domain;
    const headersList = await headers();
    const subdomain = await getSubdomainFromHeaders(headers, { mainDomains: ['www', 'app', 'admin'] });
    
    // Also check the x-subdomain header set by middleware
    const subdomainFromHeader = headersList.get('x-subdomain');
    
    const storeSubdomain = subdomain || subdomainFromHeader;
    
    // If we have a subdomain from headers, use it (subdomain takes precedence)
    // Otherwise, use the domain from params (path-based routing)
    if (storeSubdomain) {
        storeDomain = storeSubdomain;
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

    // Build product URL for SEO (subdomain-aware)
    const domainPart = process.env.NEXT_PUBLIC_DOMAIN || 'yurait.vercel.app';
    const productUrl = storeSubdomain 
        ? `https://${storeSubdomain}.${domainPart}`
        : `https://${domainPart}/${locale}/${storeDomain}`;

    return (
        <>
            <ThemeInjector theme={store?.theme || {}} />
            <ProductPageClientWrapper product={product} store={store} productUrl={productUrl} />
        </>
    );
}

// ----------------------
// SEO Metadata
// ----------------------
export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale?: string }> }) {
    const { slug, locale = 'en' } = await params;
    return generateProductMetadata(slug, locale);
}

// Optional: viewport theme
export async function generateViewport({ params }: { params: Promise<{ domain?: string }> }) {
    const { domain } = await params;
    const sub = await getSubdomainFromHeaders(headers, { mainDomains: ['www','app','admin','yurait'] });
    const storeDomain = (sub || domain || '').toLowerCase().trim();
    if (storeDomain) {
        const store = await getStoreByDomain(storeDomain);
        const primary = (store?.theme as any)?.primaryColor;
        return { themeColor: primary || '#3B82F6' };
    }
    return { themeColor: '#3B82F6' };
}

export const revalidate = 60;
