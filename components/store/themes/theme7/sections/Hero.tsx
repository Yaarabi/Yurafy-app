import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#f97316';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;

    return (
        <div className="relative text-white min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-900 via-red-900 to-orange-800">
            {/* Food Geometric Pattern */}
            <GeometricDecorations type="food" color={primaryColor} />
            
            {/* Hero Image Overlay */}
            {hero.imageUrl && (
                <div 
                    className="absolute inset-0 bg-cover bg-center scale-110 opacity-20" 
                    style={{ backgroundImage: `url(${hero.imageUrl})` }}
                ></div>
            )}
            
            {/* Gradient Overlay */}
            <div 
                className="absolute inset-0" 
                style={{ background: `linear-gradient(180deg, ${primaryColor}cc, ${secondaryColor}ee)` }}
            ></div>
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl z-10">
                
                <motion.h2 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight"
                >
                    {hero.title}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-white/95 font-light"
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
                        className="group relative inline-flex items-center gap-2 bg-white text-[var(--color-primary)] font-bold py-4 px-10 rounded-full text-lg sm:text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 border-4 border-white/50 overflow-hidden"
                        style={{ color: primaryColor }}
                    >
                        <span className="relative z-10">Shop Now</span>
                        <motion.span
                            className="relative z-10"
                            animate={{ rotate: [0, 20, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            🍊
                        </motion.span>
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

