import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#F59E0B';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;

    return (
        <div className="relative text-white min-h-[85vh] overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-12 h-full">
                <div className="col-span-12 lg:col-span-7 relative">
                    <div 
                        className="absolute inset-0 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${hero.imageUrl})` }}
                    ></div>
                    <div 
                        className="absolute inset-0" 
                        style={{ background: `linear-gradient(45deg, ${primaryColor}cc, ${secondaryColor}dd)` }}
                    ></div>
                </div>
                <div className="hidden lg:block col-span-5 relative"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 transform rotate-12 origin-top-right rounded-full"></div>
                </div>
            </div>
            <div className="relative container mx-auto px-6 py-20 lg:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:max-w-lg"
                    >
                        <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 text-sm font-bold uppercase tracking-wider">
                            Featured
                        </div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight"
                        >
                            {hero.title}
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-xl sm:text-2xl md:text-3xl mb-10 text-white/90 leading-relaxed font-medium"
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
                                className="inline-block bg-white text-[var(--color-primary)] font-black py-5 px-10 rounded-none text-lg uppercase tracking-widest shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-4 border-white"
                                style={{ color: primaryColor }}
                            >
                                Shop Now
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;

