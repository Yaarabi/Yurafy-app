export const revalidate = 3600;

import { generateStoreMetadata } from "@/lib/metadata/storeMetadata";
import { getStoreByDomain } from "@/lib/data/store";
import { getProductsByOwner } from "@/lib/data/products"; 
import ThemeInjector from "@/components/productPage/ThemeInjector";
import ShopClientWrapper from "@/components/pages/shopWrapper";
import NotFound from "../not-found";
import { headers } from "next/headers";
import { getSubdomainFromHeaders } from "@/lib/utils/subdomain";

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale?: string }> }) {
    const { domain, locale = 'en' } = await params;
    const sub = await getSubdomainFromHeaders(headers, { mainDomains: ['www','app','admin','yurafy'] });
    const effectiveDomain = (sub || domain).toLowerCase().trim();
    return await generateStoreMetadata(effectiveDomain, locale);
}

export async function generateViewport({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const sub = await getSubdomainFromHeaders(headers, { mainDomains: ['www','app','admin','yurafy'] });
    const storeDomain = (sub || domain).toLowerCase().trim();
    const store = await getStoreByDomain(storeDomain);
    const primary = (store?.theme as any)?.primaryColor || '#3B82F6';
    return { themeColor: primary };
}



export default async function ShopPage({ params, searchParams }: { 
    params: Promise<{ domain: string; locale?: string }>;
    searchParams: Promise<{ category?: string }>;
}) {
    const { domain, locale = 'en' } = await params;
    const { category } = await searchParams;
    
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
    
    // Normalize domain (lowercase, trim)
    storeDomain = storeDomain.toLowerCase().trim();
    
    const store = await getStoreByDomain(storeDomain);

    if (!store || !store.owner) {
        return <> <NotFound/> </>;
    }

    // Ensure owner is a valid string
    const ownerId = typeof store.owner === 'string' ? store.owner : store.owner;
    const products = await getProductsByOwner(ownerId);

    // Build store URL for SEO (subdomain-aware)
    const domainPart = process.env.NEXT_PUBLIC_DOMAIN || 'yurafy.vercel.app';
    const storeUrl = storeSubdomain 
        ? `https://${storeSubdomain}.${domainPart}`
        : `https://${domainPart}/${locale}/${storeDomain}`;

    return (
        <>
            <ThemeInjector theme={store.theme} />
            <ShopClientWrapper 
                store={store} 
                products={products} 
                storeUrl={storeUrl}
                selectedCategory={category}
            />
        </>
    );
}

