import { generateStoreMetadata } from "@/lib/metadata/storeMetadata";
import { getStoreByDomain } from "@/lib/data/store";
import { getProductsByOwner } from "@/lib/data/products"; 
import ThemeInjector from "@/components/productPage/ThemeInjector";
import StoreClientWrapper from "@/components/pages/storeWrapper";
import NotFound from "./not-found";

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale?: string }> }) {
    const { domain } = await params;
    
    // Domain param already contains the correct domain from middleware rewrite
    // Middleware rewrites subdomain.example.com -> /en/{subdomain}
    const storeDomain = domain;
    
    return await generateStoreMetadata(storeDomain);
}

export async function generateViewport({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    
    // Domain param already contains the correct domain from middleware rewrite
    const storeDomain = domain;
    
    const store = await getStoreByDomain(storeDomain);
    return { themeColor: store?.theme };
}

export const revalidate = 60;

export default async function StorePage({ params }: { params: Promise<{ domain: string; locale?: string }> }) {
    const { domain } = await params;
    
    // Domain param already contains the correct domain from middleware rewrite
    // Middleware rewrites subdomain.example.com -> /en/{subdomain}
    // Or direct path access like /en/mystore uses the path param
    // Normalize domain (lowercase, trim)
    const storeDomain = domain.toLowerCase().trim();
    
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
