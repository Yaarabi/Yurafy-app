"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "../../hooks/useStore";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { IProduct } from "@/models/store/products";
import { Clock, Tag, ArrowRight } from "lucide-react";
import { getStoreTranslation } from "../../utils/translations";

const SpecialOffer: React.FC = () => {
    const { selectedStore, products, disableNavigation } = useStore();
    const router = useRouter();
    const params = useParams();
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
    const [offerProduct, setOfferProduct] = useState<IProduct | null>(null);

    useEffect(() => {
        if (!selectedStore?.specialOffer) return;

        // Find the product by ID
        const product = products.find(
            (p) => p._id === selectedStore.specialOffer?.productId
        );
        setOfferProduct(product || null);

        // Calculate time left
        const updateTimeLeft = () => {
            const endTime = new Date(selectedStore.specialOffer!.offerTimeEnd);
            const now = new Date();
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft(null);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [selectedStore?.specialOffer, products]);

    // Don't show if no offer, no product, or offer is paused
    if (!selectedStore?.specialOffer || !offerProduct || selectedStore.specialOffer.paused) return null;

    const primaryColor = selectedStore.theme?.primaryColor || '#3B82F6';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const storeLanguage = selectedStore.language || 'en';
    const discount = selectedStore.specialOffer.discount || 0;
    const description = selectedStore.specialOffer.description || '';
    const originalPrice = offerProduct.price;
    const discountedPrice = originalPrice * (1 - discount / 100);

    const handleViewProduct = () => {
        if (disableNavigation) return;
        const locale = (params as any)?.locale || "en";
        const domain = (params as any)?.domain || selectedStore.domain;
        const href = `/${locale}/${domain}/shop/${offerProduct.slug}`;
        router.push(href);
    };

    return (
        <div className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, ${primaryColor}40 0%, transparent 50%),
                                    radial-gradient(circle at 80% 80%, ${secondaryColor}40 0%, transparent 50%)`
                }}></div>
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                            {/* Image Section */}
                            <div className="relative h-64 sm:h-80 lg:h-full min-h-[300px] overflow-hidden">
                                <motion.img
                                    src={offerProduct.mainImage}
                                    alt={offerProduct.name}
                                    className="w-full h-full object-cover"
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.5 }}
                                />
                                <div className="absolute top-4 left-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                        className="px-4 py-2 rounded-full text-white font-bold text-sm sm:text-base shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Tag className="inline w-4 h-4 mr-1" />
                                        {discount}% OFF
                                    </motion.div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                                {description && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm sm:text-base font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: primaryColor }}
                                    >
                                        {description}
                                    </motion.p>
                                )}
                                
                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
                                >
                                    {offerProduct.name}
                                </motion.h3>

                                {/* Price */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-3 mb-6"
                                >
                                    <span className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
                                        ${discountedPrice.toFixed(2)}
                                    </span>
                                    <span className="text-xl text-gray-400 line-through">
                                        ${originalPrice.toFixed(2)}
                                    </span>
                                </motion.div>

                                {/* Countdown Timer */}
                                {timeLeft && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 }}
                                        className="mb-6"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock className="w-5 h-5" style={{ color: primaryColor }} />
                                            <span className="text-sm sm:text-base font-semibold text-gray-700">
                                                {getStoreTranslation("offerEndsIn", storeLanguage) || "Offer ends in"}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 sm:gap-3">
                                            {timeLeft.days > 0 && (
                                                <div className="flex flex-col items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-100">
                                                    <span className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                                                        {timeLeft.days}
                                                    </span>
                                                    <span className="text-xs text-gray-600">Days</span>
                                                </div>
                                            )}
                                            <div className="flex flex-col items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-100">
                                                <span className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                                                    {String(timeLeft.hours).padStart(2, '0')}
                                                </span>
                                                <span className="text-xs text-gray-600">Hours</span>
                                            </div>
                                            <div className="flex flex-col items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-100">
                                                <span className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                                                    {String(timeLeft.minutes).padStart(2, '0')}
                                                </span>
                                                <span className="text-xs text-gray-600">Mins</span>
                                            </div>
                                            <div className="flex flex-col items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-100">
                                                <span className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                                                    {String(timeLeft.seconds).padStart(2, '0')}
                                                </span>
                                                <span className="text-xs text-gray-600">Secs</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* CTA Button */}
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleViewProduct}
                                    className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <motion.div
                                        className="absolute inset-0"
                                        style={{ backgroundColor: secondaryColor }}
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <span className="relative z-10 flex items-center gap-2">
                                        {getStoreTranslation("shopNow", storeLanguage) || "Shop Now"}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SpecialOffer;

