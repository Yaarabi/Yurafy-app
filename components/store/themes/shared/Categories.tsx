"use client";

import React from "react";
import { useStore } from "../../hooks/useStore";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getStoreTranslation } from "../../utils/translations";

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
        <div className="py-12 sm:py-16 md:py-20" style={{ backgroundColor: surfaceColor }}>
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

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
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
                            className="group cursor-pointer bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                                <motion.img
                                    src={category.img}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center justify-between text-white">
                                        <span className="font-semibold text-sm sm:text-base">{category.name}</span>
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 sm:p-4">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300" style={{
                                    backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                } as React.CSSProperties}>
                                    {category.name}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Categories;

