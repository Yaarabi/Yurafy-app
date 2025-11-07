import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();
    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#06b6d4';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const storeLanguage = selectedStore.language || 'en';

    return (
        <div className="relative text-white min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-900 via-sky-900 to-cyan-800">
            {/* Tech Geometric Pattern */}
            <GeometricDecorations type="tech" color={primaryColor} />
            
            {/* Hero Image Overlay */}
            {hero.imageUrl && (
                <div className="absolute inset-0 grid grid-cols-12 h-full">
                    <div className="col-span-12 lg:col-span-6 relative">
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-30" 
                            style={{ backgroundImage: `url(${hero.imageUrl})` }}
                        ></div>
                        <div 
                            className="absolute inset-0" 
                            style={{ background: `linear-gradient(135deg, ${primaryColor}cc, ${secondaryColor}dd)` }}
                        ></div>
                    </div>
                    <div className="hidden lg:block col-span-6 relative"
                        style={{ background: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 transform -rotate-12 origin-top-right rounded-full"></div>
                    </div>
                </div>
            )}
            
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 z-10">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl"
                >
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
                    >
                        {hero.title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-lg sm:text-xl md:text-2xl mb-12 text-white/95 leading-relaxed font-bold"
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
                            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full text-base sm:text-lg font-black uppercase tracking-widest text-white border-4 border-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 overflow-hidden"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <span className="relative z-10">{getStoreTranslation("shopNow", storeLanguage)}</span>
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

