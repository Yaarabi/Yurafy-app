import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();
    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#16a34a';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;

    return (
        <div className="relative text-white min-h-[75vh] flex items-center justify-center overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${hero.imageUrl})` }}
            ></div>
            <div 
                className="absolute inset-0" 
                style={{ background: `linear-gradient(135deg, ${primaryColor}ee, ${secondaryColor}dd)` }}
            ></div>
            <div className="relative container mx-auto px-6 text-center max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm"
                    >
                        <span className="text-sm font-semibold uppercase tracking-wider">🌱 Eco-Friendly</span>
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight"
                    >
                        {hero.title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-xl sm:text-2xl md:text-3xl mb-12 text-white/95 leading-relaxed"
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
                            className="inline-block px-10 py-4 rounded-full text-lg font-bold text-white border-2 border-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Shop Sustainably
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

