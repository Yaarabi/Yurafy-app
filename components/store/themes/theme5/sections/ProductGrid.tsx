"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/store/products";
import GeometricDecorations from "../../shared/GeometricDecorations";
import { getStoreTranslation } from "../../../utils/translations";

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, rotate: -2 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, products, disableNavigation } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();
    
    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#06b6d4';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#e6f9fd';
    const surfaceGradient = surfaceColor
    const storeLanguage = selectedStore.language || 'en';

    const handleViewProduct = (e: React.MouseEvent, product: IProduct) => {
        e.stopPropagation();
        if (disableNavigation) return;
        const locale = (params as any)?.locale || "en";
        
        // Always use /locale/shop/slug format (subdomain handles store context)
        const href = `/${locale}/shop/${product.slug}`;
        router.push(href);
    };

    const handleAddToCart = (e: React.MouseEvent, product: IProduct) => {
        e.stopPropagation();
        if (disableNavigation) return;
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
            {/* Tech Geometric Pattern */}
            <GeometricDecorations type="tech" color={primaryColor} className="opacity-5" />
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4" style={{ color: primaryColor }}>
                        {getStoreTranslation("ourCollection", storeLanguage)}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-24 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    </div>
                </motion.div>

                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-xl font-bold">No products available.</p>
                ) : (
                    <>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-12"
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
                        {displayedProducts.map((product, index) => (
                            <motion.div
                                key={product._id}
                                variants={cardVariants}
                                className="group relative bg-white rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden flex flex-col border-2 border-transparent hover:border-[var(--color-primary)] transform hover:-translate-y-2"
                            >
                                {/* Tech Corner Accent */}
                                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10">
                                    <div 
                                        className="absolute top-0 right-0 w-0 h-0 border-l-[32px] border-l-transparent border-t-[32px] transition-all duration-300 group-hover:border-t-[40px] group-hover:border-l-[40px]"
                                        style={{ borderTopColor: primaryColor }}
                                    ></div>
                                </div>
                                
                                <div className="relative overflow-hidden h-80">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.15 }}
                                        transition={{ duration: 0.6 }}
                                    />
                                    {/* Tech Overlay */}
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <GeometricDecorations type="tech" color={primaryColor} className="opacity-30" />
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
                                    <div className="pt-6 border-t-4" style={{ borderColor: primaryColor }}>
                                        <p 
                                            className="text-3xl font-black mb-3"
                                            style={{ color: primaryColor }}
                                        >
                                            ${product.price?.toFixed(2) ?? "0.00"}
                                        </p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => handleViewProduct(e, product)}
                                                className="flex-1 px-4 py-3 bg-[var(--color-primary)] text-white text-sm font-black uppercase tracking-wider rounded-none hover:bg-[var(--color-primary)]/90 transition-colors duration-300"
                                            >
                                                    {getStoreTranslation('view', storeLanguage)}
                                            </button>
                                            <button 
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="flex-1 px-4 py-3 border-2 text-sm font-black uppercase tracking-wider rounded-none transition-colors duration-300 hover:bg-[var(--color-primary)] hover:text-white"
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
                                className="px-8 py-4 bg-[var(--color-primary)] text-white text-base font-black uppercase tracking-wider rounded-none hover:bg-[var(--color-primary)]/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

