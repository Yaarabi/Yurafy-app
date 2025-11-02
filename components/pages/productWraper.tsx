
"use client";

import React from "react";
import ProductCompo from "@/components/pages/ProductPage";
import { IProduct } from "@/models/products";
import { SerializedStore } from "@/lib/data/products";
import { StoreProvider } from "@/components/store/context/StoreContext";
import Cart from "@/components/store/components/Cart";

interface ProductPageClientWrapperProps {
    product: IProduct;
    store: SerializedStore | null;
}

const ProductPageClientWrapper: React.FC<ProductPageClientWrapperProps> = ({ product, store }) => {

    if(!store) return <h2>Not Found</h2>
    return (
        <StoreProvider stores={[store]} initialStore={store}>
            <ProductCompo product={product} store={store} />
            <Cart />
        </StoreProvider>
    );
};

export default ProductPageClientWrapper;
