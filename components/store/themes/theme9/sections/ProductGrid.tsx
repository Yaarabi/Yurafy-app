"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";

const cardVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, products } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();

    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#1F2937';

    const handleViewProduct = (e: React.MouseEvent, product: IProduct) => {
        e.stopPropagation();
        const locale = (params as any)?.locale || "en";
        const href = `/${locale}/shop/${product.slug}`;
        router.push(href);
    };

    const handleAddToCart = (e: React.MouseEvent, product: IProduct) => {
        e.stopPropagation();
        const success = addToCart(product, 1);
        if (success) {
            openCart();
        }
    };

    return (
        <div id="products" className="py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl sm:text-6xl md:text-7xl font-light text-center mb-20 tracking-tight"
                    style={{ color: primaryColor }}
                >
                    Products
                </motion.h3>

                {products.length === 0 ? (
                    <p className="text-center text-gray-400 text-xl font-light">No products available.</p>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.15 },
                            },
                        }}
                    >
                        {products.map((product) => (
                            <motion.div
                                key={product._id}
                                variants={cardVariants}
                                className="group bg-white border border-gray-200 hover:border-[var(--color-primary)] transition-all duration-500 overflow-hidden flex flex-col"
                            >
                                <div className="relative overflow-hidden h-80">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="p-8 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-2xl font-light text-gray-900 mb-4 leading-tight">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-gray-500 mb-6 line-clamp-3 font-light">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="pt-6 border-t border-gray-200">
                                        <p 
                                            className="text-3xl font-light tracking-tight mb-3"
                                            style={{ color: primaryColor }}
                                        >
                                            ${product.price?.toFixed(2) ?? "0.00"}
                                        </p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => handleViewProduct(e, product)}
                                                className="flex-1 px-4 py-2 border text-sm font-light tracking-wide transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]"
                                                style={{ 
                                                    borderColor: primaryColor,
                                                    color: primaryColor,
                                                    backgroundColor: 'transparent'
                                                }}
                                            >
                                                View
                                            </button>
                                            <button 
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="flex-1 px-4 py-2 border text-sm font-light tracking-wide transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]"
                                                style={{ 
                                                    borderColor: primaryColor,
                                                    color: primaryColor,
                                                    backgroundColor: 'transparent'
                                                }}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProductGrid;

