"use client";

import React, { type CSSProperties } from "react";
import { useStore } from "../../../hooks/useStore";
import { useCart } from "../../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { IProduct } from "@/models/products";
import GeometricDecorations from "../../shared/GeometricDecorations";
import { getStoreTranslation } from "../../../utils/translations";

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, rotate: -2 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5 } },
};

const toRgba = (hexColor: string, alpha = 1) => {
    const normalized = hexColor.replace('#', '');
    const expanded = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized.slice(0, 6);
    const bigint = Number.parseInt(expanded || '6366f1', 16);
    const value = Number.isNaN(bigint) ? 0x6366f1 : bigint;

    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const createLightGradient = (base: string, accent: string) => {
    return `linear-gradient(140deg, ${toRgba(base, 0.18)} 0%, ${toRgba(accent, 0.12)} 55%, rgba(255,255,255,0.96) 100%)`;
};

const ProductGrid: React.FC = () => {
    const { selectedStore, products } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();

    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#6366f1';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const surfaceColor = selectedStore.theme?.surfaceColor || primaryColor;
    const headingColor = '#0f172a';
    const copyColor = 'rgba(15, 23, 42, 0.72)';
    const storeLanguage = selectedStore.language || 'en';

    const handleViewProduct = (e: React.MouseEvent, product: IProduct) => {
        e.stopPropagation();
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

    const productGridBackgroundStyle: CSSProperties = {
        background: createLightGradient(surfaceColor, secondaryColor),
    };

    return (
        <section id="products" className="relative overflow-hidden py-24 text-slate-900" style={productGridBackgroundStyle}>
            <GeometricDecorations type="professional" color={primaryColor} className="opacity-20" />
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `linear-gradient(115deg, ${toRgba(surfaceColor, 0.16)} 0%, transparent 55%), radial-gradient(circle at 85% 20%, ${toRgba(primaryColor, 0.18)}, transparent 60%)`,
                }}
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: -24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-14"
                >
                    <div
                        className="inline-flex items-center gap-3 rounded-full border bg-white px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em]"
                        style={{ borderColor: toRgba(primaryColor, 0.25), color: primaryColor, backgroundColor: toRgba(primaryColor, 0.08) }}
                    >
                        {getStoreTranslation('products', storeLanguage)}
                    </div>
                    <h3 className="mt-6 text-3xl font-semibold sm:text-4xl md:text-5xl" style={{ color: headingColor }}>
                        {getStoreTranslation('ourCollection', storeLanguage)}
                    </h3>
                    <div className="mt-6 flex items-center gap-3">
                        <span className="h-px w-20" style={{ backgroundColor: toRgba(surfaceColor, 0.25) }} />
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="h-px flex-1" style={{ backgroundColor: toRgba(primaryColor, 0.18) }} />
                    </div>
                </motion.div>

                {products.length === 0 ? (
                    <p className="text-center" style={{ color: copyColor }}>No products available.</p>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
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
                            <motion.article
                                key={product._id}
                                variants={cardVariants}
                                onClick={(event) => handleViewProduct(event, product)}
                                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-white text-slate-900 shadow-[0_35px_100px_-60px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1.5"
                                style={{ borderColor: toRgba(primaryColor, 0.18), boxShadow: `0 35px 80px -50px ${toRgba(primaryColor, 0.45)}` }}
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-slate-950/10 to-transparent" />
                                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-35" style={{ backgroundColor: toRgba(primaryColor, 0.6) }} />
                                    <div className="pointer-events-none absolute -right-10 top-8 h-24 w-24 rotate-45" style={{ border: `1px solid ${toRgba(primaryColor, 0.16)}` }} />
                                </div>

                                <div className="flex flex-1 flex-col gap-6 p-8">
                                    <div className="flex-1">
                                        <h4 className="text-xl font-semibold leading-tight" style={{ color: headingColor }}>
                                            {product.name}
                                        </h4>
                                        <p className="mt-4 text-sm leading-relaxed line-clamp-3" style={{ color: copyColor }}>
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="pt-6" style={{ borderTop: `1px solid ${toRgba(primaryColor, 0.18)}` }}>
                                        <p className="text-2xl font-semibold" style={{ color: primaryColor }}>
                                            ${product.price?.toFixed(2) ?? '0.00'}
                                        </p>
                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={(event) => handleViewProduct(event, product)}
                                                className="flex-1 rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] transition-colors duration-300"
                                                style={{ color: primaryColor, borderColor: toRgba(primaryColor, 0.25), backgroundColor: toRgba(primaryColor, 0.08) }}
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={(event) => handleAddToCart(event, product)}
                                                className="flex-1 rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition-colors duration-300"
                                                style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default ProductGrid;

