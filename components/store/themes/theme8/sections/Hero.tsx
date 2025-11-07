import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#ec4899';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;

    return (
        <div className="relative text-white min-h-[75vh] grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-gradient-to-br from-pink-900 via-rose-900 to-pink-800">
            {/* Playful Geometric Pattern */}
            <GeometricDecorations type="playful" color={primaryColor} />
            
            <div className="relative order-2 lg:order-1 flex items-center justify-center p-8 lg:p-16 bg-gradient-to-br z-10"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-lg"
                >
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                    >
                        {hero.title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 leading-relaxed"
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
                            className="group relative inline-flex items-center gap-2 bg-white text-[var(--color-primary)] font-bold py-4 px-10 rounded-lg text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-white overflow-hidden"
                            style={{ color: primaryColor }}
                        >
                            <span className="relative z-10">Shop Now</span>
                            <motion.span
                                className="relative z-10"
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                🎮
                            </motion.span>
                        </a>
                    </motion.div>
                </motion.div>
            </div>
            <div className="relative order-1 lg:order-2 min-h-[40vh] lg:min-h-full">
                {hero.imageUrl && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-30" 
                        style={{ backgroundImage: `url(${hero.imageUrl})` }}
                    ></div>
                )}
                <div 
                    className="absolute inset-0" 
                    style={{ background: `linear-gradient(45deg, ${primaryColor}40, ${secondaryColor}40)` }}
                ></div>
            </div>
        </div>
    );
};

export default Hero;

