"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, selectProduct } = useStore();

    if (!selectedStore) return null;

    const products = (selectedStore as any).products as IProduct[] || [];
    const primaryColor = selectedStore.theme?.primaryColor || '#8B5CF6';

    return (
        <div id="products" className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h3
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl sm:text-6xl font-black text-center mb-16"
                    style={{ color: primaryColor }}
                >
                    Our Products
                </motion.h3>

                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-xl">No products available.</p>
                ) : (
                    <motion.div
                        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
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
                        {products.map((product, index) => (
                            <motion.div
                                key={product._id}
                                variants={cardVariants}
                                onClick={() => selectProduct(product)}
                                className="group cursor-pointer bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-400 overflow-hidden break-inside-avoid mb-6 transform hover:-translate-y-2"
                                style={{ 
                                    borderTop: `4px solid ${primaryColor}`,
                                }}
                            >
                                <div className="relative overflow-hidden h-64">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="p-6">
                                    <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                        {product.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                        {product.description}
                                    </p>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <p 
                                            className="text-2xl font-black"
                                            style={{ color: primaryColor }}
                                        >
                                            ${product.price?.toFixed(2) ?? "0.00"}
                                        </p>
                                        <span 
                                            className="px-4 py-2 rounded-full text-sm font-bold text-white"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            View
                                        </span>
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

