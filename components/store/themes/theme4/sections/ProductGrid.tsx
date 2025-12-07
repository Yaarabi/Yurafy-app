"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";
import GeometricDecorations from "../../shared/GeometricDecorations";
import { getStoreTranslation } from "../../../utils/translations";

const cardVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, products, disableNavigation } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();
    
    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#22c55e';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#e9f9ef';
    const surfaceGradient = surfaceColor
    const storeLanguage = selectedStore.language || 'en';

    const handleViewProduct = (e: React.MouseEvent, product: IProduct) => {
        e.stopPropagation();
        if (disableNavigation) return;
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

    const handleViewAllProducts = () => {
        if (disableNavigation) return;
        const locale = (params as any)?.locale || "en";
        const domain = (params as any)?.domain || selectedStore.domain;
        const href = `/${locale}/${domain}/shop`;
        router.push(href);
    };

    // Show only latest 4 products
    const displayedProducts = products.slice(0, 4);

    return (
        <div id="products" className="relative py-24 overflow-hidden" style={{ background: surfaceGradient }}>
            {/* Organic Geometric Pattern */}
            <GeometricDecorations type="organic" color={primaryColor} className="opacity-5" />
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-center mb-4 tracking-tight"
                        style={{ color: primaryColor }}
                    >
                        {getStoreTranslation("products", storeLanguage)}
                    </motion.h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-24 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    </div>
                </motion.div>

                {products.length === 0 ? (
                    <p className="text-center text-gray-400 text-xl font-light">No products available.</p>
                ) : (
                    <>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12 lg:gap-16"
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
                        {displayedProducts.map((product) => (
                            <motion.div
                                key={product._id}
                                variants={cardVariants}
                                className="group relative bg-white border border-gray-200 hover:border-[var(--color-primary)] transition-all duration-500 overflow-hidden flex flex-col"
                            >
                                
                                <div className="relative overflow-hidden h-80">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    />
                                    {/* Organic Overlay */}
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <GeometricDecorations type="organic" color={primaryColor} className="opacity-30" />
                                    </div>
                                    
                                </div>
                                <div className="p-4 flex-grow flex flex-col">
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
                                                disabled={disableNavigation}
                                                className="flex-1 px-4 py-2 border text-sm font-light tracking-wide transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    borderColor: primaryColor,
                                                    color: primaryColor,
                                                    backgroundColor: 'transparent'
                                                }}
                                            >
                                                {getStoreTranslation('view', storeLanguage)}
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
                                                {getStoreTranslation('addToCart', storeLanguage)}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="text-center mt-12"
                        >
                            <button
                                onClick={handleViewAllProducts}
                                disabled={disableNavigation}
                                className="px-8 py-4 border text-base font-light tracking-wide transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ 
                                    borderColor: primaryColor,
                                    color: primaryColor,
                                    backgroundColor: 'transparent'
                                }}
                            >
                                {getStoreTranslation("viewAllProducts", storeLanguage) || "View All Products"}
                            </button>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductGrid;

