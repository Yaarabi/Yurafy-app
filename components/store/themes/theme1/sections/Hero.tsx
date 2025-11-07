import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#0ea5e9';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;

    return (
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-24 sm:py-32 lg:py-40 overflow-hidden">
            {/* Circuit Pattern Background */}
            <GeometricDecorations type="circuit" color={primaryColor} />
            
            {/* Hero Image Overlay */}
            {hero.imageUrl && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20" 
                    style={{ backgroundImage: `url(${hero.imageUrl})` }}
                ></div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent"></div>
            
            {/* Animated Circuit Lines */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-0 left-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                    <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
                        <path
                            d="M0,300 Q300,100 600,300 T1200,300"
                            fill="none"
                            stroke={primaryColor}
                            strokeWidth="2"
                            opacity="0.3"
                        />
                        <path
                            d="M0,200 Q300,400 600,200 T1200,200"
                            fill="none"
                            stroke={primaryColor}
                            strokeWidth="2"
                            opacity="0.2"
                        />
                    </svg>
                </motion.div>
            </div>
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight"
                    >
                        {hero.title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-gray-300 leading-relaxed"
                    >
                        {hero.subtitle}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <a 
                            href="#products" 
                            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base sm:text-lg font-bold text-white shadow-2xl hover:shadow-[var(--color-primary)]/50 transition-all duration-300 transform hover:scale-105 border-2 overflow-hidden"
                            style={{ 
                                backgroundColor: primaryColor,
                                borderColor: primaryColor,
                            }}
                        >
                            <span className="relative z-10">Shop Now</span>
                            <motion.div
                                className="absolute inset-0"
                                style={{ backgroundColor: secondaryColor }}
                                initial={{ x: '-100%' }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                            <motion.span
                                className="relative z-10"
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                →
                            </motion.span>
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

