"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";

const cardVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, selectProduct } = useStore();

    if (!selectedStore) return null;

    const products = (selectedStore as any).products as IProduct[] || [];
    const primaryColor = selectedStore.theme?.primaryColor || '#EC4899';

    return (
        <div id="products" className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h3
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl sm:text-5xl font-bold text-center mb-16 relative inline-block w-full"
                >
                    <span className="relative z-10 px-6" style={{ color: primaryColor }}>
                        Our Products
                    </span>
                    <span 
                        className="absolute bottom-0 left-0 w-full h-2 z-0"
                        style={{ backgroundColor: `${primaryColor}20` }}
                    ></span>
                </motion.h3>

                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-xl">No products available.</p>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
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
                                onClick={() => selectProduct(product)}
                                className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border-2 border-transparent hover:border-[var(--color-primary)]"
                            >
                                <div className="relative overflow-hidden h-72">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                                        style={{ backgroundColor: primaryColor }}
                                    ></div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <p 
                                            className="text-2xl font-bold"
                                            style={{ color: primaryColor }}
                                        >
                                            ${product.price?.toFixed(2) ?? "0.00"}
                                        </p>
                                        <button 
                                            className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-110"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            View
                                        </button>
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

