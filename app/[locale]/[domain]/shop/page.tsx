"use client";
import CollectionPage from "@/components/pages/CollectionPage";
import ThemeInjector from "@/components/productPage/ThemeInjector";
import CustomCSSJSInjector from "@/components/store/CustomCSSJSInjector";
import { SerializedStore } from "@/lib/data/store";
import { IProduct } from "@/models/products";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import NotFound from "./not-found";

function WraapShopPage() {
    const [store, setStore] = useState<SerializedStore | null>(null);
    const [products, setProducts] = useState<IProduct[]>([]);
    const params = useParams();

    useEffect(() => {
        const fetchData = async () => {
        const domain = typeof params.domain === "string" ? params.domain : "";
        const locale = typeof params.locale === "string" ? params.locale : "en";

        try {
            const storeRes = await fetch(`/api/store?slug=${domain}`);
            const storeData = await storeRes.json();

            if (storeData) {
            setStore(storeData);

            const productsRes = await fetch(`/api/products?owner=${storeData.owner}`);
            const productsData = await productsRes.json();

            if (productsData?.products) {
                setProducts(productsData.products);
            }
            }
        } catch (error) {
            console.error("Error fetching store or products:", error);
        }
        };

        fetchData();
    }, [params.domain]);

    if (!store) {
        return <NotFound/>;
    }

    const onProductSelect = (product: IProduct) => {
        const domain = typeof params.domain === "string" ? params.domain : "";
        const locale = typeof params.locale === "string" ? params.locale : "en";
        window.location.href = `/${locale}/${domain}/shop/${product.slug}`;
    };

    return (
        <>
            <ThemeInjector theme={store.theme} />
            <CustomCSSJSInjector 
                customCSS={store.customization?.customCSS} 
                customJS={store.customization?.customJS} 
            />
            <CollectionPage store={store} products={products} onProductSelect={onProductSelect} />
        </>
    );
}

export default WraapShopPage;
