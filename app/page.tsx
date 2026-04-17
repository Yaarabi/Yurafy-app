
export const revalidate = 30;

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getStoreByDomain } from '@/lib/data/store';
import { getProductsByOwner } from '@/lib/data/products';
import ThemeInjector from '@/components/productPage/ThemeInjector';
import StoreClientWrapper from '@/components/pages/storeWrapper';
import NotFound from './[locale]/[domain]/not-found';
import { getSubdomainFromHeaders } from '@/lib/utils/subdomain';
import { generateStoreMetadata } from '@/lib/metadata/storeMetadata';

export default async function RootPage() {
    // Check if we're using subdomain (exclude main domains like www, app, admin)
    const headersList = await headers();
    const subdomain = await getSubdomainFromHeaders(headers, { 
        mainDomains: ['www', 'app', 'admin'] 
    });
    
    // Also check the x-subdomain header set by middleware
    const subdomainFromHeader = headersList.get('x-subdomain');
    
    const storeSubdomain = subdomain || subdomainFromHeader;
    
    if (storeSubdomain) {
        // If subdomain exists, load the store page
        const storeDomain = storeSubdomain.toLowerCase().trim();
        const store = await getStoreByDomain(storeDomain);
        
        if (!store || !store.owner) {
            return <NotFound/>;
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
    
    // No subdomain, redirect to default locale
    redirect('/en/services');
}

// Provide store-specific metadata when accessed via subdomain root
export async function generateMetadata() {
    const hdrs = await headers();
    const xSub = hdrs.get('x-subdomain');
    const sub = xSub || await getSubdomainFromHeaders(headers, { mainDomains: ['www','app','admin','yurait'] });
    if (sub) {
        return await generateStoreMetadata(sub.toLowerCase().trim(), 'en');
    }
    return {};
}

export async function generateViewport() {
    const hdrs = await headers();
    const xSub = hdrs.get('x-subdomain');
    const sub = xSub || await getSubdomainFromHeaders(headers, { mainDomains: ['www','app','admin','yurait'] });
    if (sub) {
        const store = await getStoreByDomain(sub.toLowerCase().trim());
        const primary = (store as any)?.theme?.primaryColor || '#3B82F6';
        return { themeColor: primary };
    }
    return { themeColor: '#3B82F6' };
}
