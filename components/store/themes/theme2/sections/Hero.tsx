import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getStoreTranslation } from '../../../utils/translations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#f43f5e';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const storeLanguage = selectedStore.language || 'en';

    return (
        <div className="relative text-white min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Animated gradient background */}
            <div 
                className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                style={{
                    backgroundImage: hero.imageUrl ? `url(${hero.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div 
                    className="absolute inset-0 bg-gradient-to-br"
                    style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}f5, ${secondaryColor}e5, ${primaryColor}d5)` 
                    }}
                />
            </div>
            
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10 py-12 sm:py-16">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Sparkle badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6 sm:mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
                            {getStoreTranslation("premium", storeLanguage) || "Premium Collection"}
                        </span>
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tight"
                    >
                        {hero.title}
                    </motion.h1>
                    
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="h-1 w-24 sm:w-32 mx-auto mb-6 sm:mb-8 rounded-full"
                        style={{ backgroundColor: 'white' }}
                    />
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 text-white/90 leading-relaxed max-w-3xl mx-auto px-4"
                    >
                        {hero.subtitle}
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
                    >
                        <a
                            href="#products"
                            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-base sm:text-lg font-bold bg-white text-gray-900 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
                        >
                            <span>{getStoreTranslation("shopNow", storeLanguage)}</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a
                            href="#about"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base sm:text-lg font-semibold bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 transition-all duration-300 w-full sm:w-auto justify-center"
                        >
                            {getStoreTranslation("learnMore", storeLanguage) || "Learn More"}
                        </a>
                    </motion.div>
                </div>
            </div>
            
            {/* Bottom wave decoration */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" className="w-full h-auto">
                    <path
                        fill="white"
                        d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                    />
                </svg>
            </div>
        </div>
    );
};

export default Hero;

