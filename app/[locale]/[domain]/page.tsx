import { generateStoreMetadata } from "@/lib/metadata/storeMetadata";
import { getStoreByDomain } from "@/lib/data/store";
import { getProductsByOwner } from "@/lib/data/products"; 
import ThemeInjector from "@/components/productPage/ThemeInjector";
import StoreClientWrapper from "@/components/pages/storeWrapper";
import NotFound from "./not-found";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    return await generateStoreMetadata(domain);
}

export async function generateViewport({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const store = await getStoreByDomain(domain);
    return { themeColor: store?.theme };
}

export const revalidate = 60;

export default async function StorePage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const store = await getStoreByDomain(domain);

    if (!store || !store.owner) {
        // console.log(store);
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
