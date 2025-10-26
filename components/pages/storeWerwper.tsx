
"use client";

import React from "react";
import StoreComponent from "./StorePage";
import { SerializedStore } from "@/lib/data/products";
import { IProduct } from "@/models/products";
import { useParams } from "next/navigation";

interface StoreClientWrapperProps {
    store: SerializedStore;
    products: IProduct[];
}

const StoreClientWrapper: React.FC<StoreClientWrapperProps> = ({ store, products }) => {

    const params = useParams()
    
    const onProductSelect = (product: IProduct) => {
        window.location.href = `/${params.locale}/${params.domain}/shop/${product.slug}`;
    };

    return (
        <StoreComponent
        store={store}
        products={products}
        onProductSelect={onProductSelect}
        />
    );
};

export default StoreClientWrapper;
