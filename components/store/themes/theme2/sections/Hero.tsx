import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#ca8a04';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;

    return (
        <div className="relative text-white min-h-[80vh] flex items-center justify-center overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${hero.imageUrl})` }}
            ></div>
            <div 
                className="absolute inset-0" 
                style={{ background: `linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor}cc)` }}
            ></div>
            <div className="relative container mx-auto px-6 text-center max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-12 lg:p-16 border border-white/20"
                >
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight italic"
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
                        className="text-xl sm:text-2xl md:text-3xl mb-12 text-white/95 leading-relaxed font-light"
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
                            className="inline-block px-10 py-4 rounded-full text-lg font-semibold text-[var(--color-primary)] bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            style={{ color: primaryColor }}
                        >
                            Discover Our Collection
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

