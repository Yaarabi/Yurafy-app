
"use client"; 

import React from "react";
import ProductCard from "./ProductCard";
import { IProduct } from "@/models/products";

interface FeaturedProductsProps {
    products: IProduct[];
    onProductSelect: (product: IProduct) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
    products,
    onProductSelect,
    }) => {
    return (
        <section id="featured-products" className="py-16 bg-white">
        <div className="container mx-auto px-4">
            <h2
            className="text-3xl font-bold text-center mb-2"
            style={{ color: "var(--secondary-color)" }}
            >
            Featured Products
            </h2>
            <div
            className="w-24 h-1 mx-auto mb-10"
            style={{ backgroundColor: "var(--primary-color)" }}
            ></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
                <ProductCard
                key={product._id}
                product={product}
                onProductSelect={onProductSelect} // ✅ works now
                />
            ))}
            </div>
        </div>
        </section>
    );
};

export default FeaturedProducts;
