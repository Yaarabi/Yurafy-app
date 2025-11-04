
import ProductPageClientWrapper from '@/components/pages/productWraper';
import { getProductWithStoreBySlug } from '@/lib/data/products';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';
import ThemeInjector from '@/components/productPage/ThemeInjector';

import { getStoreByDomain } from '@/lib/data/store';
import NotFound from '@/app/[locale]/[domain]/not-found';
import { headers } from "next/headers";

// Extract subdomain from hostname header
async function getSubdomainFromHeaders(): Promise<string | null> {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const hostname = host.split(':')[0]; // Remove port if present
    
    // Handle localhost/development
    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1') || hostname.startsWith('192.168.')) {
        const parts = hostname.split('.');
        if (parts.length > 1 && parts[0] !== 'localhost') {
            return parts[0];
        }
        return null;
    }
    
    // For production domains (e.g., store.example.com)
    const parts = hostname.split('.');
    // If we have more than 2 parts, the first is the subdomain
    // Example: store.yura-saas.com -> ['store', 'yura-saas', 'com']
    if (parts.length >= 3) {
        return parts[0];
    }
    
    return null;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    // Get subdomain from headers
    const subdomain = await getSubdomainFromHeaders();
    
    if (!subdomain) {
        // If no subdomain, redirect to locale/domain route
        return <NotFound/>;
    }
    
    // Normalize domain (lowercase, trim)
    const storeDomain = subdomain.toLowerCase().trim();
    
    const { product, store } = await getProductWithStoreBySlug(slug);

    if (!product) {
        return <NotFound/>;
    }
    
    // Verify the product belongs to the store with this subdomain
    if (store && store.domain !== storeDomain) {
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
export async function generateViewport({ params }: { params: Promise<{ slug: string }> }) {
    const subdomain = await getSubdomainFromHeaders();
    
    if (subdomain) {
        const storeDomain = subdomain.toLowerCase().trim();
        const store = await getStoreByDomain(storeDomain);
        return { themeColor: store?.theme };
    }
    
    return { themeColor: undefined };
}

export const revalidate = 60;

