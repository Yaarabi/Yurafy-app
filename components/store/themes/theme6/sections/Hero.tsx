import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#f59e0b';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;

    return (
        <div className="relative text-white py-24 sm:py-32 lg:py-40 overflow-hidden bg-gradient-to-br from-amber-900 via-orange-900 to-amber-800">
            {/* Cultural Geometric Pattern */}
            <GeometricDecorations type="cultural" color={primaryColor} />
            
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
                style={{ background: `linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor}dd)` }}
            ></div>
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-12 lg:p-16 max-w-4xl mx-auto border border-white/20 shadow-2xl"
                >
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 drop-shadow-lg"
                    >
                        {hero.title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                        className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-white/90"
                    >
                        {hero.subtitle}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.8 }}
                    >
                        <a 
                            href="#products" 
                            className="group relative inline-flex items-center gap-2 bg-white text-[var(--color-primary)] font-bold py-4 px-10 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                            style={{ color: primaryColor }}
                        >
                            <span className="relative z-10">Shop Now</span>
                            <motion.span
                                className="relative z-10"
                                animate={{ rotate: [0, 15, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                🎨
                            </motion.span>
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

