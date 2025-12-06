"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";
import { ShoppingCart, Eye, Sparkles } from "lucide-react";
import { getStoreTranslation } from "../../../utils/translations";

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, products, disableNavigation } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();

    if (!selectedStore) return null;
    const primaryColor = selectedStore.theme?.primaryColor || '#ca8a04';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#f8fafc';
    const surfaceGradient = surfaceColor
    const storeLanguage = selectedStore.language?.split('-')[0]?.toLowerCase() || 'en';

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
        <div id="products" className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden" style={{ background: surfaceGradient }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 sm:mb-6"
                        style={{ 
                            backgroundColor: `${primaryColor}10`,
                            borderColor: `${primaryColor}30`,
                        }}
                    >
                        <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                            {getStoreTranslation("featured", storeLanguage) || "Featured"}
                        </span>
                    </motion.div>
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 text-gray-900">
                        {getStoreTranslation("ourCollection", storeLanguage)}
                    </h2>
                    
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-1 w-20 sm:w-24 mx-auto rounded-full"
                        style={{ backgroundColor: primaryColor }}
                    />
                </motion.div>

                {products.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                        <p className="text-lg sm:text-xl text-gray-500">
                            {getStoreTranslation("noProducts", storeLanguage) || "No products available."}
                        </p>
                    </div>
                ) : (
                    <>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.05 }}
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
                                whileHover={{ y: -8 }}
                                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
                            >
                                <div className="relative overflow-hidden aspect-square">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.4 }}
                                    />

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => handleViewProduct(e, product)}
                                            disabled={disableNavigation}
                                            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                                            title={getStoreTranslation('view', storeLanguage)}
                                        >
                                            <Eye className="w-5 h-5" style={{ color: primaryColor }} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                                            style={{ backgroundColor: primaryColor }}
                                            title={getStoreTranslation('addToCart', storeLanguage)}
                                        >
                                            <ShoppingCart className="w-5 h-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="p-5 flex-grow flex flex-col">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-opacity-80 transition-all">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 flex-grow line-clamp-2">
                                        {product.description}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-lg font-bold text-gray-900">
                                            ${product.price.toFixed(2)}
                                        </div>
                                        <div className="hidden sm:flex gap-2">
                                            <button
                                                onClick={(e) => handleViewProduct(e, product)}
                                                disabled={disableNavigation}
                                                className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    borderColor: primaryColor,
                                                    color: primaryColor,
                                                }}
                                            >
                                                {getStoreTranslation('view', storeLanguage)}
                                            </button>
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                {getStoreTranslation('addToCart', storeLanguage)}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 sm:hidden mt-4">
                                        <button
                                            onClick={(e) => handleViewProduct(e, product)}
                                            disabled={disableNavigation}
                                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                borderColor: primaryColor,
                                                color: primaryColor,
                                            }}
                                        >
                                            {getStoreTranslation('view', storeLanguage) || 'View'}
                                        </button>
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            {getStoreTranslation('addToCart', storeLanguage) || 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                    {products.length > 4 && (
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

