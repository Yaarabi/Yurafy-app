import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#f43f5e';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const storeLanguage = selectedStore.language || 'en';

    return (
        <div className="relative text-white min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-900 via-pink-900 to-rose-800">
            {/* Elegant Geometric Pattern */}
            <GeometricDecorations type="elegant" color={primaryColor} />
            
            {/* Hero Image Overlay */}
            {hero.imageUrl && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30" 
                    style={{ backgroundImage: `url(${hero.imageUrl})` }}
                ></div>
            )}
            
            {/* Gradient Overlay */}
            <div 
                className="absolute inset-0" 
                style={{ background: `linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor}cc)` }}
            ></div>
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/20 shadow-2xl"
                >
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight italic"
                    >
                        {hero.title}
                    </motion.h2>
                    <motion.div 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '100px' }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="h-1 bg-white mx-auto mb-8"
                        style={{ backgroundColor: secondaryColor }}
                    ></motion.div>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-lg sm:text-xl md:text-2xl mb-12 text-white/95 leading-relaxed font-light"
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
                            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full text-base sm:text-lg font-semibold bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                            style={{ color: primaryColor }}
                        >
                            <span className="relative z-10">{getStoreTranslation("shopNow", storeLanguage)}</span>
                            <motion.span
                                className="relative z-10"
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                →
                            </motion.span>
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

