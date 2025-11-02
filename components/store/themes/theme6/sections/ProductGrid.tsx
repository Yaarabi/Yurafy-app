"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, selectProduct } = useStore();

    if (!selectedStore) return null;

    const products = (selectedStore as any).products as IProduct[] || [];
    const primaryColor = selectedStore.theme?.primaryColor || '#3B82F6';

    return (
        <div id="products" className="py-16 bg-gradient-to-br from-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h3
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl sm:text-5xl font-bold text-center mb-12"
                    style={{ color: primaryColor }}
                >
                    Our Products
                </motion.h3>

                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg">No products available.</p>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                                onClick={() => selectProduct(product)}
                                className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-2"
                            >
                                <div className="relative overflow-hidden h-64">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.15 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                                        style={{ backgroundColor: primaryColor }}
                                    ></div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2 truncate">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <p 
                                            className="text-2xl font-extrabold"
                                            style={{ color: primaryColor }}
                                        >
                                            ${product.price?.toFixed(2) ?? "0.00"}
                                        </p>
                                        <button 
                                            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300 transform hover:scale-110"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            View Details
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

