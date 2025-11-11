import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getStoreTranslation } from '../../../utils/translations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#f59e0b';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const storeLanguage = selectedStore.language || 'en';

    return (
        <div className="relative text-white min-h-[90vh] flex items-center overflow-hidden">
            {/* Background with image and gradient */}
            <div 
                className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                style={{
                    backgroundImage: hero.imageUrl ? `url(${hero.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div 
                    className="absolute inset-0"
                    style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}f0, ${secondaryColor}e8)` 
                    }}
                />
            </div>

            {/* Floating elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white/10"
                        style={{
                            width: Math.random() * 100 + 50,
                            height: Math.random() * 100 + 50,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10 py-16 sm:py-20">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-6 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6 sm:mb-8"
                        >
                            <span className="text-sm sm:text-base font-semibold uppercase tracking-wider">
                                {getStoreTranslation("welcome", storeLanguage) || "Welcome"}
                            </span>
                        </motion.div>
                        
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 sm:mb-8 leading-tight"
                        >
                            {hero.title}
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-10 sm:mb-12 text-white/90 leading-relaxed max-w-3xl mx-auto px-4"
                        >
                            {hero.subtitle}
                        </motion.p>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <a
                                href="#products"
                                className="group inline-flex items-center gap-3 px-8 py-4 bg-white rounded-full font-bold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
                                style={{ color: primaryColor }}
                            >
                                <span>{getStoreTranslation("shopNow", storeLanguage)}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
                <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
                    <path
                        fill="white"
                        d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z"
                    />
                </svg>
            </div>
        </div>
    );
};

export default Hero;

