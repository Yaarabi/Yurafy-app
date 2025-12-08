"use client";

import React from "react";
import { useStore } from "../../../hooks/useStore";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getStoreTranslation } from "../../../utils/translations";

const Categories: React.FC = () => {
    const { selectedStore, disableNavigation } = useStore();
    const router = useRouter();
    const params = useParams();

    if (!selectedStore?.categories || selectedStore.categories.length === 0) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#3B82F6';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const surfaceColor = selectedStore.theme?.surfaceColor || '#f1f5f9';
    const storeLanguage = selectedStore.language || 'en';

    const handleCategoryClick = (categoryName: string) => {
        if (disableNavigation) return;
        const locale = (params as any)?.locale || "en";
        const domain = (params as any)?.domain || selectedStore.domain;
        const href = `/${locale}/${domain}/shop?category=${encodeURIComponent(categoryName)}`;
        router.push(href);
    };

    return (
        <div className="py-12 sm:py-16 md:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        {getStoreTranslation("categories", storeLanguage) || "Categories"}
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

                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                    {selectedStore.categories.map((category, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategoryClick(category.name)}
                            className="group cursor-pointer flex flex-col items-center text-center gap-3"
                        >
                            <div
                                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 overflow-hidden rounded-full border-4 flex-shrink-0"
                                style={{ borderColor: primaryColor }}
                            >
                                <motion.img
                                    src={category.img}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                            </div>
                            <div className="flex items-center gap-2 text-gray-900 font-bold text-base sm:text-lg group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300" style={{
                                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                            } as React.CSSProperties}>
                                <span>{category.name}</span>
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Categories;

