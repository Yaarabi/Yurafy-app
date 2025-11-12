import { generateStoreMetadata } from "@/lib/metadata/storeMetadata";
import { getStoreByDomain } from "@/lib/data/store";
import { getProductsByOwner } from "@/lib/data/products"; 
import ThemeInjector from "@/components/productPage/ThemeInjector";
import StoreClientWrapper from "@/components/pages/storeWrapper";
import NotFound from "./not-found";
import { headers } from "next/headers";
import { getSubdomainFromHeaders } from "@/lib/utils/subdomain";

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale?: string }> }) {
    const { domain, locale = 'en' } = await params;
    // Prefer subdomain if present in headers; otherwise use path domain
    const sub = await getSubdomainFromHeaders(headers, { mainDomains: ['www','app','admin','yurait'] });
    const effectiveDomain = (sub || domain).toLowerCase().trim();
    return await generateStoreMetadata(effectiveDomain, locale);
}

export async function generateViewport({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const sub = await getSubdomainFromHeaders(headers, { mainDomains: ['www','app','admin','yurait'] });
    const storeDomain = (sub || domain).toLowerCase().trim();
    const store = await getStoreByDomain(storeDomain);
    const primary = (store?.theme as any)?.primaryColor || '#3B82F6';
    return { themeColor: primary };
}

export const revalidate = 60;

export default async function StorePage({ params }: { params: Promise<{ domain: string; locale?: string }> }) {
    const { domain, locale = 'en' } = await params;
    
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
    const domainPart = process.env.NEXT_PUBLIC_DOMAIN || 'yurait.vercel.app';
    const storeUrl = storeSubdomain 
        ? `https://${storeSubdomain}.${domainPart}`
        : `https://${domainPart}/${locale}/${storeDomain}`;

    return (
        <>
            <ThemeInjector theme={store.theme} />
            <StoreClientWrapper store={store} products={products} storeUrl={storeUrl} />
        </>
    );
}
