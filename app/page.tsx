
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getStoreByDomain } from '@/lib/data/store';
import { getProductsByOwner } from '@/lib/data/products';
import ThemeInjector from '@/components/productPage/ThemeInjector';
import StoreClientWrapper from '@/components/pages/storeWrapper';
import NotFound from './[locale]/[domain]/not-found';
import { getSubdomainFromHeaders } from '@/lib/utils/subdomain';

export default async function RootPage() {
    // Check if we're using subdomain (exclude main domains like www, app, admin)
    const subdomain = await getSubdomainFromHeaders(headers, { 
        mainDomains: ['www', 'app', 'admin'] 
    });
    
    if (subdomain) {
        // If subdomain exists, load the store page
        const storeDomain = subdomain.toLowerCase().trim();
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
    redirect('/en');
}
