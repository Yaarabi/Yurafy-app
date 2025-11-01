import React from 'react';
import { useStore } from '../hooks/useStore';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;

    return (
        <div className="relative bg-gray-800 text-white py-20 sm:py-32 overflow-hidden">
            <motion.div 
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.4 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${hero.imageUrl})` }}
            ></motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
            <div className="relative container mx-auto px-6 text-center">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                    className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg"
                >
                    {hero.title}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                    className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-200"
                >
                    {hero.subtitle}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
                >
                    <a 
                        href="#products" 
                        className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 shadow-xl"
                    >
                        Shop Now
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;