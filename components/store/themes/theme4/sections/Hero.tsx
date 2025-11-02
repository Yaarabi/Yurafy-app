import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();
    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#4b5563';

    return (
        <div className="relative text-white min-h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-20" 
                style={{ backgroundImage: `url(${hero.imageUrl})` }}
            ></div>
            <div className="relative container mx-auto px-6 text-center max-w-4xl">
                <motion.h2 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light mb-8 tracking-tight leading-none"
                >
                    {hero.title}
                </motion.h2>
                <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '80px' }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-0.5 bg-white mx-auto mb-12"
                ></motion.div>
                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="text-2xl sm:text-3xl md:text-4xl mb-16 text-gray-300 leading-relaxed font-light max-w-2xl mx-auto"
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
                        className="inline-block px-12 py-4 border-2 border-white text-lg font-light tracking-wide hover:bg-white hover:text-gray-900 transition-all duration-500"
                    >
                        Shop Now
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

