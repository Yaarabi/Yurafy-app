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
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
                {/* Content Section */}
                <div className="text-center space-y-6 mb-12 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-2 rounded-full text-sm font-bold"
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
                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
                    >
                        {aboutData.title || `About ${brandName}`}
                    </motion.h2>
                    
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="h-1 w-20 rounded-full mx-auto"
                        style={{ backgroundColor: primaryColor }}
                    />
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-4"
                    >
                        {aboutData.description}
                    </motion.p>
                </div>
                
                {/* Icons Section Below */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12"
                >
                    {[Heart, Star, Target].map((Icon, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default About;

