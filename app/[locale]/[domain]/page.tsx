import { generateStoreMetadata } from "@/lib/metadata/storeMetadata";
import { getStoreByDomain } from "@/lib/data/store";
import { getProductsByOwner } from "@/lib/data/products"; 
import ThemeInjector from "@/components/productPage/ThemeInjector";
import CustomCSSJSInjector from "@/components/store/CustomCSSJSInjector";
import StoreClientWrapper from "@/components/pages/storeWerwper";
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

    if (!store) {
        return <> <NotFound/> </>;
    }

    const products = await getProductsByOwner(store.owner);

    return (
        <>
            <ThemeInjector theme={store.theme} />
            <CustomCSSJSInjector 
                customCSS={store.customization?.customCSS} 
                customJS={store.customization?.customJS} 
            />
            <StoreClientWrapper store={store} products={products} />
        </>
    );
}
