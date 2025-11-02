"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, selectProduct } = useStore();

    if (!selectedStore) return null;

    const products = (selectedStore as any).products as IProduct[] || [];
    const primaryColor = selectedStore.theme?.primaryColor || '#ca8a04';

    return (
        <div id="products" className="py-20 bg-amber-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold italic mb-6" style={{ color: primaryColor }}>
                        Our Collection
                    </h3>
                    <div className="w-32 h-1 mx-auto rounded-full" style={{ backgroundColor: primaryColor }}></div>
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
                                transition: { staggerChildren: 0.15 },
                            },
                        }}
                    >
                        {products.map((product) => (
                            <motion.div
                                key={product._id}
                                variants={cardVariants}
                                onClick={() => selectProduct(product)}
                                className="group cursor-pointer bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border-2 border-transparent hover:border-[var(--color-primary)]"
                            >
                                <div className="relative overflow-hidden h-72">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                    />
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold italic text-gray-900 mb-3 line-clamp-2">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t-2" style={{ borderColor: `${primaryColor}30` }}>
                                        <p 
                                            className="text-2xl font-bold italic"
                                            style={{ color: primaryColor }}
                                        >
                                            ${product.price?.toFixed(2) ?? "0.00"}
                                        </p>
                                        <button 
                                            className="px-6 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-110"
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

