"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, products } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();
    
    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#16a34a';

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
        <div id="products" className="py-20 bg-green-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-3 mb-6 rounded-full"
                        style={{ backgroundColor: `${primaryColor}20` }}
                    >
                        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                            🌱 Sustainable Products
                        </span>
                    </div>
                    <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4" style={{ color: primaryColor }}>
                        Our Products
                    </h3>
                    <div className="w-32 h-2 mx-auto rounded-full" style={{ backgroundColor: primaryColor }}></div>
                </motion.div>

                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg">No products available.</p>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 },
                            },
                        }}
                    >
                        {products.map((product) => (
                            <motion.div
                                key={product._id}
                                variants={cardVariants}
                                className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border-4 border-transparent hover:border-[var(--color-primary)]"
                            >
                                <div className="relative overflow-hidden h-72">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                    />
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white rounded-full text-xs font-bold uppercase tracking-wider"
                                        style={{ color: primaryColor }}
                                    >
                                        Eco
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t-2" style={{ borderColor: `${primaryColor}30` }}>
                                        <p 
                                            className="text-2xl font-bold mb-3"
                                            style={{ color: primaryColor }}
                                        >
                                            ${product.price?.toFixed(2) ?? "0.00"}
                                        </p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => handleViewProduct(e, product)}
                                                className="flex-1 px-4 py-2 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                View
                                            </button>
                                            <button 
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="flex-1 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all duration-300 hover:scale-105"
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

