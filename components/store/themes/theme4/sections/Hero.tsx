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
    const primaryColor = selectedStore.theme?.primaryColor || '#22c55e';
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
                <GeometricDecorations type="organic" color="#ffffff" />
            </div>
            
            {/* Header on top of hero background */}
            <div className="relative z-20 flex-shrink-0">
                <Header />
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl z-10 flex-1 flex flex-col items-center justify-center py-8 sm:py-12 md:py-16">
                <div className="w-full">
                    <motion.h2 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light mb-4 sm:mb-6 md:mb-8 tracking-tight leading-tight sm:leading-none"
                    >
                        {hero.title}
                    </motion.h2>
                    <motion.div 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '80px' }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-0.5 bg-white mx-auto mb-6 sm:mb-8 md:mb-12"
                    ></motion.div>
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 md:mb-16 text-gray-300 leading-relaxed font-light max-w-2xl mx-auto"
                    >
                        {hero.subtitle}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <a 
                            href="#products" 
                            className="group relative inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 border-2 border-white text-sm sm:text-base md:text-lg font-light tracking-wide hover:bg-white hover:text-gray-900 transition-all duration-500 overflow-hidden"
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

