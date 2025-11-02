"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, rotate: -2 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, selectProduct } = useStore();
    if (!selectedStore) return null;

    const products = (selectedStore as any).products as IProduct[] || [];
    const primaryColor = selectedStore.theme?.primaryColor || '#db2777';

    return (
        <div id="products" className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10"
                style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)` }}
            ></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-block px-6 py-2 mb-4 bg-[var(--color-primary)] text-white font-black uppercase tracking-widest text-sm">
                        Products
                    </div>
                    <h3 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight" style={{ color: primaryColor }}>
                        Our Collection
                    </h3>
                </motion.div>

                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-xl font-bold">No products available.</p>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
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
                        {products.map((product, index) => (
                            <motion.div
                                key={product._id}
                                variants={cardVariants}
                                onClick={() => selectProduct(product)}
                                className="group cursor-pointer bg-white rounded-none shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden flex flex-col border-4 border-transparent hover:border-[var(--color-primary)] transform hover:-rotate-1"
                                style={{ borderColor: index % 2 === 0 ? undefined : primaryColor }}
                            >
                                <div className="relative overflow-hidden h-80">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.15 }}
                                        transition={{ duration: 0.6 }}
                                    />
                                    <div 
                                        className="absolute top-4 right-4 px-4 py-2 bg-white font-black text-sm uppercase tracking-wider shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ color: primaryColor }}
                                    >
                                        View
                                    </div>
                                </div>
                                <div className="p-8 flex-grow flex flex-col justify-between bg-white">
                                    <div>
                                        <h4 className="text-2xl font-black uppercase text-gray-900 mb-4 tracking-tight line-clamp-2">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-6 line-clamp-3 font-medium">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t-4" style={{ borderColor: primaryColor }}>
                                        <p 
                                            className="text-3xl font-black"
                                            style={{ color: primaryColor }}
                                        >
                                            ${product.price?.toFixed(2) ?? "0.00"}
                                        </p>
                                        <span 
                                            className="px-6 py-3 bg-[var(--color-primary)] text-white text-sm font-black uppercase tracking-wider rounded-none hover:bg-[var(--color-primary)]/90 transition-colors duration-300"
                                        >
                                            Buy
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

