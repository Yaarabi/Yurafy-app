import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#1F2937';
    
    const aboutData = about || {
        title: whoWeAre?.description ? undefined : `About ${brandName}`,
        description: whoWeAre?.description || about?.description || '',
    };

    if (!aboutData.description && !aboutData.title) return null;

    return (
        <motion.div
            id="about"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="py-32 bg-white"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center">
                    <h3 className="text-5xl sm:text-6xl md:text-7xl font-light mb-12 tracking-tight"
                        style={{ color: primaryColor }}
                    >
                        {aboutData.title || `About ${brandName}`}
                    </h3>
                    <div 
                        className="w-24 h-0.5 mx-auto mb-16"
                        style={{ backgroundColor: primaryColor }}
                    ></div>
                    <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-light">
                        {aboutData.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default About;

