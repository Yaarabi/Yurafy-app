import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#1F2937';

    return (
        <div className="relative text-white min-h-[90vh] flex items-center justify-center overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-20" 
                style={{ backgroundImage: `url(${hero.imageUrl})` }}
            ></div>
            <div 
                className="absolute inset-0" 
                style={{ background: `linear-gradient(180deg, ${primaryColor}, ${primaryColor}dd)` }}
            ></div>
            <div className="relative container mx-auto px-6 text-center max-w-4xl">
                <motion.h2 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light mb-8 tracking-tight leading-none"
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
                    className="text-2xl sm:text-3xl md:text-4xl max-w-2xl mx-auto mb-16 font-light tracking-wide"
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
                        className="inline-block border-2 px-12 py-4 text-xl font-light tracking-wide hover:bg-white hover:text-[var(--color-primary)] transition-all duration-500"
                        style={{ 
                            borderColor: selectedStore.theme?.textColor || '#ffffff',
                            color: selectedStore.theme?.textColor || '#ffffff'
                        }}
                    >
                        Shop Now
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

