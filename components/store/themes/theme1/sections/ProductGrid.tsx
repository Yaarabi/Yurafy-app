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
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, products, disableNavigation } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();

    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#0891b2';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#f1f5f9';
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
        <div id="products" className="relative py-20 overflow-hidden" style={{ backgroundColor: surfaceColor }}>
            {/* Subtle Circuit Pattern */}
            <GeometricDecorations type="circuit" color={primaryColor} className="opacity-5" />
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {getStoreTranslation("ourProducts", storeLanguage)}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-24 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    </div>
                </motion.div>

                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg">No products available.</p>
                ) : (
                    <>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
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
                        {displayedProducts.map((product) => (
                            <motion.div
                                key={product._id}
                                variants={cardVariants}
                                className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border-2 border-transparent hover:border-[var(--color-primary)]"
                            >
                                {/* Tech Corner Accent */}
                                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10">
                                    <div 
                                        className="absolute top-0 right-0 w-0 h-0 border-l-[32px] border-l-transparent border-t-[32px] transition-all duration-300 group-hover:border-t-[40px] group-hover:border-l-[40px]"
                                        style={{ borderTopColor: primaryColor }}
                                    ></div>
                                </div>
                                
                                <div className="relative overflow-hidden h-64">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    {/* Tech Overlay with Circuit Pattern */}
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <GeometricDecorations type="circuit" color={primaryColor} className="opacity-30" />
                                    </div>
                                    
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
                                    <div className="pt-4 border-t border-gray-200">
                                        <p 
                                            className="text-2xl font-bold mb-3"
                                            style={{ color: primaryColor }}
                                        >
                                            ${product.price?.toFixed(2) ?? "0.00"}
                                        </p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => handleViewProduct(e, product)}
                                                disabled={disableNavigation}
                                                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {getStoreTranslation('view', storeLanguage)}
                                            </button>
                                            <button 
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-300 hover:scale-105"
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
                    {products.length > 0 && (
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
                                className="px-8 py-4 rounded-lg text-base sm:text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {getStoreTranslation("viewAllProducts", storeLanguage) || "View All Products"}
                            </button>
                        </motion.div>
                    )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductGrid;

