import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import { Heart, Star, Target } from 'lucide-react';

const About: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#f43f5e';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#fff1f5';
    const surfaceGradient = `linear-gradient(180deg, ${surfaceColor} 0%, #ffffff 100%)`;
    
    const aboutData = about || {
        title: whoWeAre?.description ? undefined : `About ${brandName}`,
        description: whoWeAre?.description || '',
    };

    if (!aboutData.description && !aboutData.title) return null;

    return (
        <div
            id="about"
            className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
            style={{ background: surfaceGradient }}
        >
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
                    style={{ backgroundColor: primaryColor }}
                />
                <div 
                    className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
                    style={{ backgroundColor: primaryColor }}
                />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left side - Visual element */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square lg:aspect-auto lg:h-full min-h-[400px]"
                            style={{ 
                                background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)` 
                            }}
                        >
                            {/* Icon grid decoration */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="grid grid-cols-3 gap-8 sm:gap-12">
                                    {[Heart, Star, Target].map((Icon, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Right side - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 sm:mb-6"
                                style={{ 
                                    backgroundColor: `${primaryColor}15`,
                                    color: primaryColor 
                                }}
                            >
                                OUR STORY
                            </motion.div>
                            
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight"
                            >
                                {aboutData.title || `About ${brandName}`}
                            </motion.h2>
                            
                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="h-1 w-20 rounded-full mb-6"
                                style={{ backgroundColor: primaryColor }}
                            />
                        </div>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-base sm:text-lg text-gray-600 leading-relaxed"
                        >
                            {aboutData.description}
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default About;

