import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';
import Header from './Header';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#f97316';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const storeLanguage = selectedStore.language || 'en';

    return (
        <div className="relative text-white min-h-[100vh] sm:min-h-screen flex flex-col overflow-hidden">
            {/* Hero Image Background */}
            {hero.imageUrl && (
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${hero.imageUrl})` }}
                >
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
            )}
            
            {/* Organic Geometric Pattern */}
            <div className="absolute inset-0 opacity-10">
                <GeometricDecorations type="food" color="#ffffff" />
            </div>
            
            {/* Header on top of hero background */}
            <div className="relative z-20 flex-shrink-0">
                <Header />
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl z-10 flex-1 flex flex-col items-center justify-center py-8 sm:py-12 md:py-16">
                <div className="w-full">
                    <motion.h2 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 md:mb-6 tracking-tight leading-tight"
                    >
                        {hero.title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-8 sm:mb-12 text-white/95 font-light"
                    >
                        {hero.subtitle}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <a 
                            href="#products" 
                            className="group relative inline-flex items-center gap-2 bg-white text-[var(--color-primary)] font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full text-base sm:text-lg md:text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 border-4 border-white/50 overflow-hidden"
                            style={{ color: primaryColor }}
                        >
                            <span className="relative z-10">{getStoreTranslation("shopNow", storeLanguage)}</span>
                        </a>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;

