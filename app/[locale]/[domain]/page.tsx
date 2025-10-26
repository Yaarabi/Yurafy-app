import { generateStoreMetadata } from "@/lib/metadata/storeMetadata";
import { getStoreByDomain } from "@/lib/data/store";
import { getProductsByOwner } from "@/lib/data/products"; 
import ThemeInjector from "@/components/productPage/ThemeInjector";
import StoreClientWrapper from "@/components/pages/storeWerwper";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    return await generateStoreMetadata(domain);
}

export async function generateViewport({ params }: { params: { domain: string } }) {
    const { domain } = await params;
    const store = await getStoreByDomain(domain);
    return { themeColor: store?.theme };
}

export const revalidate = 60;

export default async function StorePage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const store = await getStoreByDomain(domain);

    if (!store) {
        return <div className="text-center py-20">Store not found.</div>;
    }

    const products = await getProductsByOwner(store.owner);

    return (
        <>
            <ThemeInjector theme={store.theme} />
            <StoreClientWrapper store={store} products={products} />
        </>
    );
}
