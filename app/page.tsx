
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getStoreByDomain } from '@/lib/data/store';
import { getProductsByOwner } from '@/lib/data/products';
import ThemeInjector from '@/components/productPage/ThemeInjector';
import StoreClientWrapper from '@/components/pages/storeWrapper';
import NotFound from './[locale]/[domain]/not-found';

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

export default async function RootPage() {
    // Check if we're using subdomain
    const subdomain = await getSubdomainFromHeaders();
    
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
