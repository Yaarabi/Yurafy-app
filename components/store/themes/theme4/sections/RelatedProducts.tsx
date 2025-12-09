"use client";

import React, { useMemo } from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/store/products";
import GeometricDecorations from "../../shared/GeometricDecorations";
import { getStoreTranslation } from "../../../utils/translations";
import ProductCard from "./ProductCard";

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const RelatedProducts: React.FC = () => {
    const { selectedStore, products, selectedProduct, disableNavigation } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();

    // Get related products: same category, excluding current product, sorted by newest first
    const relatedProducts = useMemo(() => {
        if (!selectedStore || !selectedProduct || !selectedProduct.category) {
            return [];
        }
        
        
        const filtered = products
            .filter(p => {
                const isSameCategory = p.category === selectedProduct.category;
                const isDifferentProduct = p._id !== selectedProduct._id;
                return isSameCategory && isDifferentProduct;
            })
            .sort((a, b) => {
                // Sort by createdAt (newest first)
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            })
            .slice(0, 4); // Show max 4 related products
            
        console.log('RelatedProducts - Filtered result:', filtered.length, 'products');
        return filtered;
    }, [products, selectedProduct, selectedStore]);
    
    if (!selectedStore || !selectedProduct) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#22c55e';
    const storeLanguage = selectedStore.language || 'en';

    // Don't render if no related products
    if (relatedProducts.length === 0) return null;

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

    return (
        <div className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
            {/* Organic Geometric Pattern */}
            <GeometricDecorations type="organic" color={primaryColor} className="opacity-5" />
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12 sm:mb-16 lg:mb-20"
                >
                    <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-center mb-4 tracking-tight"
                        style={{ color: primaryColor }}
                    >
                        {getStoreTranslation("relatedProducts", storeLanguage) || "Related Products"}
                    </motion.h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-24 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base font-light max-w-2xl mx-auto">
                        {getStoreTranslation("discoverMore", storeLanguage) || "Discover more products from the same category"}
                    </p>
                </motion.div>

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
                    {relatedProducts.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            primaryColor={primaryColor}
                            storeLanguage={storeLanguage}
                            disableNavigation={disableNavigation}
                            onViewProduct={handleViewProduct}
                            onAddToCart={handleAddToCart}
                            variants={cardVariants}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default RelatedProducts;
