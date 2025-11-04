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
        // Check if we're using subdomain (e.g., store.yura-saas.com)
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const parts = hostname ? hostname.split('.') : [];
        // Subdomain detection: if hostname has 3+ parts and not localhost (e.g., store.yura-saas.com)
        const isSubdomain = parts.length >= 3 && !hostname.includes('localhost') && !hostname.startsWith('127.0.0.1');
        
        let href: string;
        if (isSubdomain) {
            // With subdomain: /shop/product-slug (no locale/domain in path)
            href = `/shop/${product.slug}`;
        } else {
            // Without subdomain: /locale/domain/shop/product-slug
            const locale = (params as any)?.locale || "en";
            const domain = (params as any)?.domain || store.domain;
            href = `/${locale}/${domain}/shop/${product.slug}`;
        }
        
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
