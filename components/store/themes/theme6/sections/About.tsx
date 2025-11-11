import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import { Award, Users, Star, TrendingUp } from 'lucide-react';

const About: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#f59e0b';
    
    const aboutData = about || {
        title: whoWeAre?.description ? undefined : `About ${brandName}`,
        description: whoWeAre?.description ||  '',
    };

    if (!aboutData.description && !aboutData.title) return null;

    return (
        <section 
            id="about"
            className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden"
        >
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
                    style={{ backgroundColor: primaryColor }}
                />
                <div 
                    className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
                    style={{ backgroundColor: primaryColor }}
                />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center">
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 sm:mb-8"
                            style={{ color: primaryColor }}
                        >
                            {aboutData.title || `About ${brandName}`}
                        </motion.h3>
                        
                        <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: '96px' }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="h-1.5 mx-auto rounded-full mb-8 sm:mb-10"
                            style={{ backgroundColor: primaryColor }}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-50 rounded-3xl blur-xl" />
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-10 md:p-12 shadow-xl border border-gray-200/50">
                                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                                    {aboutData.description}
                                </p>
                            </div>
                        </motion.div>

                        {brandName && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                className="mt-8 inline-block px-8 py-4 rounded-full border-2 shadow-lg hover:shadow-2xl transition-all duration-300"
                                style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}05` }}
                            >
                                <span className="text-lg sm:text-xl font-bold" style={{ color: primaryColor }}>
                                    {brandName}
                                </span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default About;

