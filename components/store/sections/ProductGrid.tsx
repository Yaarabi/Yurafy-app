"use client";

import React from "react";
import { useStore } from "../hooks/useStore";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/store/products";

const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, selectProduct, products } = useStore();

    // ✅ If no store is selected at all, don't render anything
    if (!selectedStore) return null;


    return (
        <div id="products" className="py-16 bg-white">
            <div className="container mx-auto px-6">
                <motion.h3
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-gray-800 text-center mb-10"
                >
                    Our Products
                </motion.h3>

                {/* ✅ If no products found, show fallback message */}
                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg">
                        No products available.
                    </p>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        variants={gridVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {products.map((product) => (
                            <motion.div
                                key={product._id}
                                variants={cardVariants}
                                onClick={() => selectProduct(product)}
                                className="group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
                            >
                                <div className="relative overflow-hidden">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-56 object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    />
                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 truncate">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1 mb-3 h-10 overflow-hidden">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-lg font-bold text-[var(--color-primary)]">
                                            ${product.price?.toFixed(2) ?? "0.00"}
                                        </p>
                                        <div className="text-xs font-bold uppercase tracking-wider bg-[var(--color-primary-light)] text-[var(--color-primary)] py-1 px-3 rounded-full group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors duration-300">
                                            View
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
