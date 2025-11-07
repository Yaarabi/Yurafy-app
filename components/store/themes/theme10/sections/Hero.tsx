import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#6366f1';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const storeLanguage = selectedStore.language || 'en';

    return (
        <div className="relative text-white min-h-[85vh] overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800">
            {/* Professional Geometric Pattern */}
            <GeometricDecorations type="professional" color={primaryColor} />
            
            <div className="absolute inset-0 grid grid-cols-12 h-full">
                <div className="col-span-12 lg:col-span-7 relative">
                    {hero.imageUrl && (
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-30" 
                            style={{ backgroundImage: `url(${hero.imageUrl})` }}
                        ></div>
                    )}
                    <div 
                        className="absolute inset-0" 
                        style={{ background: `linear-gradient(45deg, ${primaryColor}cc, ${secondaryColor}dd)` }}
                    ></div>
                </div>
                <div className="hidden lg:block col-span-5 relative z-10"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 transform rotate-12 origin-top-right rounded-full"></div>
                </div>
            </div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:max-w-lg"
                    >
                        
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight"
                        >
                            {hero.title}
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-lg sm:text-xl md:text-2xl mb-10 text-white/90 leading-relaxed font-medium"
                        >
                            {hero.subtitle}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <a 
                                href="#products" 
                                className="group relative inline-flex items-center gap-2 bg-white text-[var(--color-primary)] font-black py-4 px-10 rounded-none text-lg sm:text-xl uppercase tracking-widest shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-4 border-white overflow-hidden"
                                style={{ color: primaryColor }}
                            >
                                <span className="relative z-10">{getStoreTranslation("shopNow", storeLanguage)}</span>
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;

