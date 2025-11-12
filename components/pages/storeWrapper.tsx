"use client";

import React, { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import StoreComponent from "./StorePage";
import { SerializedStore } from "@/lib/data/products";
import { IProduct } from "@/models/products";
import SeoJsonLd from "@/components/common/SeoJsonLd";

interface StoreClientWrapperProps {
    store: SerializedStore;
    products: IProduct[];
    storeUrl?: string;
}

const StoreClientWrapper: React.FC<StoreClientWrapperProps> = ({ store, products, storeUrl }) => {
    const router = useRouter();
    const params = useParams();

    const onProductSelect = useCallback((product: IProduct) => {
        // Nested routing: always use /{locale}/{domain}/shop/{slug}
        const domain = (params as any)?.domain || store.domain;
        const locale = (params as any)?.locale || 'en';
        const href = `/${locale}/${domain}/shop/${product.slug}`;
        
        try {
            router.push(href);
        } catch (err) {
            // fallback
            window.location.href = href;
        }
    }, [params, router, store.domain]);

    return (
        <>
            <SeoJsonLd store={store} storeUrl={storeUrl} />
            <StoreComponent
                store={store}
                products={products}
                onProductSelect={onProductSelect}
            />
        </>
    );
};

export default StoreClientWrapper;
