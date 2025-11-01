import React from 'react';
import { useStore } from '../hooks/useStore';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    
    // Support both 'about' and 'whoWeAre' for backward compatibility
    const aboutData = about || {
        title: whoWeAre?.description ? undefined : `About ${brandName}`,
        description: whoWeAre?.description || about?.description || '',
    };

    if (!aboutData.description && !aboutData.title) {
        return null; // Don't render if no content
    }

    return (
        <motion.div
            id="about"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="py-16 bg-white"
        >
            <div className="container mx-auto px-6 text-center">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">{aboutData.title || `About ${brandName}`}</h3>
                <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
                <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">{aboutData.description}</p>
            </div>
        </motion.div>
    );
};

export default About;