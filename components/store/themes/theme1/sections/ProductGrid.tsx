"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, selectProduct } = useStore();

    if (!selectedStore) return null;

    const products = (selectedStore as any).products as IProduct[] || [];
    const primaryColor = selectedStore.theme?.primaryColor || '#0891b2';

    return (
        <div id="products" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-2 mb-4 rounded-full"
                        style={{ backgroundColor: `${primaryColor}15` }}
                    >
                        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                            Products
                        </span>
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Our Products
                    </h3>
                    <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: primaryColor }}></div>
                </motion.div>

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
                                className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border-2 border-transparent hover:border-[var(--color-primary)]"
                            >
                                <div className="relative overflow-hidden h-64">
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
                                <div className="p-5 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
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
                                            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-110"
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

