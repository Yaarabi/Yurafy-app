"use client";

import React, { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import StoreComponent from "./StorePage";
import { SerializedStore } from "@/lib/data/products";
import { IProduct } from "@/models/products";

interface StoreClientWrapperProps {
    store: SerializedStore;
    products: IProduct[];
}

const StoreClientWrapper: React.FC<StoreClientWrapperProps> = ({ store, products }) => {
    const router = useRouter();
    const params = useParams();

    const onProductSelect = useCallback((product: IProduct) => {
        const locale = (params as any)?.locale || "en";
        const domain = (params as any)?.domain || store.domain;
        const href = `/${locale}/${domain}/shop/${product.slug}`;
        try {
            router.push(href);
        } catch (err) {
            // fallback
            window.location.href = href;
        }
    }, [params, router, store.domain]);

    return (
        <StoreComponent
            store={store}
            products={products}
            onProductSelect={onProductSelect}
        />
    );
};

export default StoreClientWrapper;
