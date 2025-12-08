"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";
import GeometricDecorations from "../../shared/GeometricDecorations";
import { getStoreTranslation } from "../../../utils/translations";

interface ProductCardProps {
    product: IProduct;
    primaryColor: string;
    storeLanguage: string;
    disableNavigation?: boolean;
    onViewProduct: (e: React.MouseEvent, product: IProduct) => void;
    onAddToCart: (e: React.MouseEvent, product: IProduct) => void;
    variants?: Variants;
}

const cardVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
};

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    primaryColor,
    storeLanguage,
    disableNavigation = false,
    onViewProduct,
    onAddToCart,
    variants = cardVariants,
}) => {
    return (
        <motion.div
            variants={variants}
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
                            onClick={(e) => onViewProduct(e, product)}
                            disabled={disableNavigation}
                            className="flex-1 px-4 py-2 border text-sm font-light tracking-wide transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                borderColor: primaryColor,
                                color: primaryColor,
                                backgroundColor: "transparent",
                            }}
                        >
                            {getStoreTranslation("view", storeLanguage)}
                        </button>
                        <button
                            onClick={(e) => onAddToCart(e, product)}
                            className="flex-1 px-4 py-2 border text-sm font-light tracking-wide transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]"
                            style={{
                                borderColor: primaryColor,
                                color: primaryColor,
                                backgroundColor: "transparent",
                            }}
                        >
                            {getStoreTranslation("addToCart", storeLanguage)}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
