import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#8B5CF6';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;

    return (
        <div className="relative text-white min-h-[85vh] flex items-center justify-center overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center scale-110" 
                style={{ backgroundImage: `url(${hero.imageUrl})` }}
            ></div>
            <div 
                className="absolute inset-0" 
                style={{ background: `linear-gradient(180deg, ${primaryColor}cc, ${secondaryColor}ee)` }}
            ></div>
            <div className="relative container mx-auto px-6 text-center max-w-5xl">
                <motion.h2 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-tight"
                >
                    {hero.title}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-xl sm:text-2xl md:text-3xl max-w-3xl mx-auto mb-12 text-white/95 font-light"
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
                        className="inline-block bg-white text-[var(--color-primary)] font-bold py-5 px-12 rounded-full text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 border-4 border-white/50"
                        style={{ color: primaryColor }}
                        >
                            Shop Now
                        </a>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

