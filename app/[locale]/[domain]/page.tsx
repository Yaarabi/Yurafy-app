import { generateStoreMetadata } from "@/lib/metadata/storeMetadata";
import { getStoreByDomain } from "@/lib/data/store";
import { getProductsByOwner } from "@/lib/data/products"; 
import ThemeInjector from "@/components/productPage/ThemeInjector";
import StoreClientWrapper from "@/components/pages/storeWrapper";
import NotFound from "./not-found";
import { headers } from "next/headers";
import { getSubdomainFromHeaders } from "@/lib/utils/subdomain";

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale?: string }> }) {
    const { domain } = await params;
    
    // If domain is from subdomain, use it directly; otherwise use path param
    let storeDomain = domain;
    
    // Check if domain param looks like a locale (edge case handling)
    if (domain && !domain.includes('/') && domain.length <= 5) {
        // Might be locale, check for subdomain
        const subdomain = await getSubdomainFromHeaders(headers);
        if (subdomain) {
            storeDomain = subdomain;
        }
    }
    
    return await generateStoreMetadata(storeDomain);
}

export async function generateViewport({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    
    // Extract actual store domain (handle subdomain case)
    let storeDomain = domain;
    const subdomain = await getSubdomainFromHeaders(headers);
    if (subdomain) {
        storeDomain = subdomain;
    }
    
    const store = await getStoreByDomain(storeDomain);
    return { themeColor: store?.theme };
}

export const revalidate = 60;

export default async function StorePage({ params }: { params: Promise<{ domain: string; locale?: string }> }) {
    const { domain } = await params;
    
    // Extract actual store domain - prioritize subdomain from headers if available
    let storeDomain = domain;
    const subdomain = await getSubdomainFromHeaders(headers);
    
    // If we have a subdomain from headers, use it (subdomain takes precedence)
    // Otherwise, use the domain from params (path-based routing)
    if (subdomain) {
        storeDomain = subdomain;
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

    return (
        <>
            <ThemeInjector theme={store.theme} />
            <StoreClientWrapper store={store} products={products} />
        </>
    );
}
