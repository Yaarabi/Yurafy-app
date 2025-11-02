import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    const { selectedStore } = useStore();
    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#16a34a';
    
    const aboutData = about || {
        title: whoWeAre?.description ? undefined : `About ${brandName}`,
        description: whoWeAre?.description || about?.description || '',
    };

    if (!aboutData.description && !aboutData.title) return null;

    return (
        <motion.div
            id="about"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="py-24 bg-white"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="bg-green-50 rounded-3xl p-12 lg:p-16 border-4" style={{ borderColor: primaryColor }}>
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-6 py-3 mb-6 rounded-full"
                            style={{ backgroundColor: `${primaryColor}20` }}
                        >
                            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                                🌱 Our Mission
                            </span>
                        </div>
                        <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                            {aboutData.title || `About ${brandName}`}
                        </h3>
                        <div className="w-32 h-2 mx-auto mb-10 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    </div>
                    <p className="text-lg sm:text-xl text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
                        {aboutData.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default About;

