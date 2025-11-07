import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#14b8a6';
    const storeLanguage = selectedStore.language || 'en';

    return (
        <div className="relative text-white min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-800">
            {/* Wellness Geometric Pattern */}
            <GeometricDecorations type="wellness" color={primaryColor} />
            
            {/* Hero Image Overlay */}
            {hero.imageUrl && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20" 
                    style={{ backgroundImage: `url(${hero.imageUrl})` }}
                ></div>
            )}
            
            {/* Gradient Overlay */}
            <div 
                className="absolute inset-0" 
                style={{ background: `linear-gradient(180deg, ${primaryColor}, ${primaryColor}dd)` }}
            ></div>
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl z-10">
                
                <motion.h2 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-8 tracking-tight leading-none"
                    style={{ color: selectedStore.theme?.textColor || '#ffffff' }}
                >
                    {hero.title}
                </motion.h2>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="w-32 h-0.5 mx-auto mb-12"
                    style={{ backgroundColor: selectedStore.theme?.textColor || '#ffffff' }}
                ></motion.div>
                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-xl sm:text-2xl md:text-3xl max-w-2xl mx-auto mb-16 font-light tracking-wide"
                    style={{ color: `${selectedStore.theme?.textColor || '#ffffff'}dd` }}
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
                        className="group relative inline-flex items-center gap-2 border-2 px-10 py-4 text-lg sm:text-xl font-light tracking-wide hover:bg-white hover:text-[var(--color-primary)] transition-all duration-500 overflow-hidden"
                        style={{ 
                            borderColor: selectedStore.theme?.textColor || '#ffffff',
                            color: selectedStore.theme?.textColor || '#ffffff',
                            '--color-primary': primaryColor
                        } as React.CSSProperties}
                    >
                        <span className="relative z-10">{getStoreTranslation("shopNow", storeLanguage)}</span>
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

