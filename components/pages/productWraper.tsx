
"use client";

import React from "react";
import ProductCompo from "@/components/pages/ProductPage";
import { IProduct } from "@/models/store/products";
import { SerializedStore } from "@/lib/data/products";
import { StoreProvider } from "@/components/store/context/StoreContext";
import Cart from "@/components/store/components/Cart";
import SeoJsonLd from "@/components/common/SeoJsonLd";

interface ProductPageClientWrapperProps {
    product: IProduct;
    store: SerializedStore | null;
    productUrl?: string;
    products?: IProduct[];
}

const ProductPageClientWrapper: React.FC<ProductPageClientWrapperProps> = ({ product, store, productUrl, products = [] }) => {

    if(!store) return <h2>Not Found</h2>
    return (
        <StoreProvider stores={[store]} initialStore={store} products={products}>
            <SeoJsonLd store={store} product={product} storeUrl={productUrl} />
            <ProductCompo product={product} store={store} />
            <Cart />
        </StoreProvider>
    );
};

export default ProductPageClientWrapper;
