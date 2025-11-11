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
    hidden: { opacity: 0, scale: 0.95, rotate: -2 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5 } },
};

const ProductGrid: React.FC = () => {
    const { selectedStore, products } = useStore();
    const { addToCart, openCart } = useCart();
    const router = useRouter();
    const params = useParams();

    if (!selectedStore) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#6366f1';
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

    return (
        <section id="products" className="relative overflow-hidden bg-slate-950 py-24">
            <GeometricDecorations type="professional" color={primaryColor} className="opacity-10" />
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `linear-gradient(115deg, ${primaryColor}12 0%, transparent 55%), radial-gradient(circle at 85% 20%, ${primaryColor}20, transparent 60%)`,
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
                        className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/70"
                        style={{ borderColor: `${primaryColor}35`, color: primaryColor }}
                    >
                        {getStoreTranslation('products', storeLanguage)}
                    </div>
                    <h3 className="mt-6 text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
                        {getStoreTranslation('ourCollection', storeLanguage)}
                    </h3>
                    <div className="mt-6 flex items-center gap-3">
                        <span className="h-px w-20 bg-white/20" />
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="h-px flex-1 bg-white/20" />
                    </div>
                </motion.div>

                {products.length === 0 ? (
                    <p className="text-center text-white/60">No products available.</p>
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
                                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.08] text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,1)] transition-all duration-300 hover:border-white/25 hover:bg-white/[0.12]"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <motion.img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-40" style={{ backgroundColor: primaryColor }} />
                                    <div className="pointer-events-none absolute -right-10 top-8 h-24 w-24 rotate-45 border border-white/10" />
                                </div>

                                <div className="flex flex-1 flex-col gap-6 p-8">
                                    <div className="flex-1">
                                        <h4 className="text-xl font-semibold leading-tight text-white">
                                            {product.name}
                                        </h4>
                                        <p className="mt-4 text-sm leading-relaxed text-white/70 line-clamp-3">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="border-t border-white/10 pt-6">
                                        <p className="text-2xl font-semibold" style={{ color: primaryColor }}>
                                            ${product.price?.toFixed(2) ?? '0.00'}
                                        </p>
                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={(event) => handleViewProduct(event, product)}
                                                className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:border-white/40 hover:bg-white/20"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={(event) => handleAddToCart(event, product)}
                                                className="flex-1 rounded-full border border-transparent bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-900 transition-colors duration-300 hover:bg-white/90"
                                                style={{ color: primaryColor }}
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

