import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#8B5CF6';
    
    const aboutData = about || {
        title: whoWeAre?.description ? undefined : `About ${brandName}`,
        description: whoWeAre?.description || about?.description || '',
    };

    if (!aboutData.description && !aboutData.title) return null;

    return (
        <motion.div
            id="about"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="py-24 bg-gray-50"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="bg-white rounded-3xl shadow-2xl p-12 lg:p-16 border-4"
                    style={{ borderColor: primaryColor }}
                >
                    <h3 className="text-4xl sm:text-5xl font-black text-center mb-8 text-gray-900">
                        {aboutData.title || `About ${brandName}`}
                    </h3>
                    <div className="flex justify-center mb-10">
                        <div 
                            className="h-1.5 w-32 rounded-full"
                            style={{ backgroundColor: primaryColor }}
                        ></div>
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

