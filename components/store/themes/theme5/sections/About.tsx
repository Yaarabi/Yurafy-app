import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    const { selectedStore } = useStore();
    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#db2777';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    
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
            className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 transform rotate-45 origin-top-right rounded-full"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                        <div className="inline-block px-4 py-2 mb-6 font-black uppercase tracking-widest text-sm"
                            style={{ 
                                backgroundColor: `${primaryColor}30`,
                                color: primaryColor 
                            }}
                        >
                            Our Story
                        </div>
                        <h3 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 leading-tight uppercase tracking-tight">
                            {aboutData.title || `About ${brandName}`}
                        </h3>
                        <div className="h-2 w-24 mb-8" style={{ backgroundColor: primaryColor }}></div>
                    </div>
                    <div className="flex items-center">
                        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-medium">
                            {aboutData.description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default About;

