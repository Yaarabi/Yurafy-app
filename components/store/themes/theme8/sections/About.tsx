import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#EC4899';
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
            className="py-24 bg-white grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0"
        >
            <div className="flex items-center justify-center p-8 lg:p-16 bg-gradient-to-br"
                style={{ background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)` }}
            >
                <div className="max-w-lg">
                    <h3 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
                        {aboutData.title || `About ${brandName}`}
                    </h3>
                    <div 
                        className="w-20 h-1 mb-6 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                    ></div>
                </div>
            </div>
            <div className="flex items-center justify-center p-8 lg:p-16">
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-lg">
                    {aboutData.description}
                </p>
            </div>
        </motion.div>
    );
};

export default About;

