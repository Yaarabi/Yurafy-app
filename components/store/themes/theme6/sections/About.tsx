import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#3B82F6';
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
            transition={{ duration: 0.6 }}
            className="py-20 bg-white relative overflow-hidden"
        >
            <div 
                className="absolute top-0 left-0 w-full h-1"
                style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}
            ></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 lg:p-16 border border-gray-100">
                    <h3 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-900">
                        {aboutData.title || `About ${brandName}`}
                    </h3>
                    <div 
                        className="w-20 h-1 mx-auto mb-8 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                    ></div>
                    <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
                        {aboutData.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default About;

