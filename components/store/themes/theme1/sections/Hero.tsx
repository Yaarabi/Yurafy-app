import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#0891b2';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;

    return (
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 sm:py-32 lg:py-40 overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-30" 
                style={{ backgroundImage: `url(${hero.imageUrl})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
            <div className="relative container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-block px-6 py-2 mb-8 rounded-full border-2"
                        style={{ 
                            borderColor: primaryColor,
                            backgroundColor: `${primaryColor}20`
                        }}
                    >
                        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                            Innovation Awaits
                        </span>
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight leading-tight"
                    >
                        {hero.title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-xl sm:text-2xl md:text-3xl max-w-3xl mx-auto mb-12 text-gray-300 leading-relaxed"
                    >
                        {hero.subtitle}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                    >
                        <a 
                            href="#products" 
                            className="inline-block px-10 py-4 rounded-lg text-lg font-bold text-white shadow-2xl hover:shadow-[var(--color-primary)]/50 transition-all duration-300 transform hover:scale-105 border-2"
                            style={{ 
                                backgroundColor: primaryColor,
                                borderColor: primaryColor,
                            }}
                        >
                            Explore Products
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

