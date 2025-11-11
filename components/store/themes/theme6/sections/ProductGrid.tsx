"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";
import { Eye, ShoppingCart } from "lucide-react";
import { getStoreTranslation } from "../../../utils/translations";

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, products, disableNavigation } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();

    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#f59e0b';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#fde7c2';
    const surfaceGradient = `linear-gradient(180deg, ${surfaceColor} 0%, #ffffff 100%)`;
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
        if (disableNavigation) return; // Still allow Add to Cart? Requirement only mentions links; keep conservative by blocking.
        const success = addToCart(product, 1);
        if (success) {
            openCart();
        }
    };

    return (
        <div id="products" className="relative py-16 sm:py-20 lg:py-24" style={{ background: surfaceGradient }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h3 
                        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" 
                        style={{ color: primaryColor }}
                    >
                        {getStoreTranslation("ourProducts", storeLanguage)}
                    </h3>
                    <div 
                        className="w-24 h-1 mx-auto rounded-full"
                        style={{ backgroundColor: primaryColor }}
                    />
                </motion.div>

                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg">No products available.</p>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
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
                                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-100">
                                    <img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    
                                    {/* Hover Overlay with Icons */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                        <motion.button
                                            onClick={(e) => handleViewProduct(e, product)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                                            style={{ color: primaryColor }}
                                        >
                                            <Eye className="w-5 h-5" />
                                        </motion.button>
                                        <motion.button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                        </motion.button>
                                    </div>

                                    {/* Price Badge */}
                                    <div 
                                        className="absolute top-4 right-4 px-4 py-2 rounded-full text-white font-bold text-lg shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        ${product.price?.toFixed(2) ?? "0.00"}
                                    </div>
                                </div>

                                <div 
                                    className="p-5 sm:p-6 cursor-pointer"
                                    onClick={() => { if (!disableNavigation) handleViewProduct({ stopPropagation: () => {} } as React.MouseEvent, product); }}
                                >
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                                        {product.name}
                                    </h4>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                                        {product.description}
                                    </p>

                                    {/* Mobile Buttons */}
                                    <div className="flex gap-3 sm:hidden">
                                        <button
                                            onClick={(e) => handleViewProduct(e, product)}
                                            className="flex-1 py-2.5 px-4 bg-white border-2 rounded-xl font-semibold transition-all duration-300"
                                            style={{ borderColor: primaryColor, color: primaryColor }}
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="flex-1 py-2.5 px-4 text-white rounded-xl font-semibold transition-all duration-300"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Add to Cart
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

