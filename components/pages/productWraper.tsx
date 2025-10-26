
"use client";

import React from "react";
import ProductCompo from "@/components/pages/ProductPage";
import { IProduct } from "@/models/products";
import { SerializedStore } from "@/lib/data/products";

interface ProductPageClientWrapperProps {
    product: IProduct;
    store: SerializedStore | null;
}

const ProductPageClientWrapper: React.FC<ProductPageClientWrapperProps> = ({ product, store }) => {

    if(!store) return <h2>Not Found</h2>
    return <ProductCompo product={product} store={store} />;
};

export default ProductPageClientWrapper;
