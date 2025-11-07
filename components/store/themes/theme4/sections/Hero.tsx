import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();
    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#22c55e';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const storeLanguage = selectedStore.language || 'en';

    return (
        <div className="relative text-white min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-emerald-900 to-green-800">
            {/* Organic Geometric Pattern */}
            <GeometricDecorations type="organic" color={primaryColor} />
            
            {/* Hero Image Overlay */}
            {hero.imageUrl && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-25" 
                    style={{ backgroundImage: `url(${hero.imageUrl})` }}
                ></div>
            )}
            
            {/* Gradient Overlay */}
            <div 
                className="absolute inset-0" 
                style={{ background: `linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor}cc)` }}
            ></div>
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl z-10">
                
                <motion.h2 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-tight leading-none"
                >
                    {hero.title}
                </motion.h2>
                <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '80px' }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-0.5 bg-white mx-auto mb-12"
                ></motion.div>
                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="text-lg sm:text-xl md:text-2xl mb-16 text-gray-300 leading-relaxed font-light max-w-2xl mx-auto"
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
                        className="group relative inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-base sm:text-lg font-light tracking-wide hover:bg-white hover:text-gray-900 transition-all duration-500 overflow-hidden"
                    >
                        <span className="relative z-10">{getStoreTranslation("shopNow", storeLanguage)}</span>
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

