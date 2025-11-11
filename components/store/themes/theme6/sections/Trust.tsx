import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';
import { DollarSign, Truck, CheckCircle } from 'lucide-react';
import { getStoreTranslation } from '../../../utils/translations';

const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#f59e0b';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#fde7c2';
    const surfaceGradient = `linear-gradient(160deg, ${surfaceColor} 0%, #ffffff 70%)`;
    const storeLanguage = selectedStore.language || 'en';

    const features = [
        {
            Icon: DollarSign,
            title: getStoreTranslation("cashOnDelivery", storeLanguage),
            description: getStoreTranslation("cashOnDeliveryDesc", storeLanguage),
        },
        {
            Icon: Truck,
            title: getStoreTranslation("fastShipping", storeLanguage),
            description: getStoreTranslation("fastShippingDesc", storeLanguage),
        },
        {
            Icon: CheckCircle,
            title: getStoreTranslation("highQuality", storeLanguage),
            description: getStoreTranslation("highQualityDesc", storeLanguage),
        },
    ];

    return (
        <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden" style={{ background: surfaceGradient }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h3 
                        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                        style={{ color: primaryColor }}
                    >
                        {getStoreTranslation("whyChooseUs", storeLanguage)}
                    </h3>
                    <div 
                        className="w-24 h-1 mx-auto rounded-full"
                        style={{ backgroundColor: primaryColor }}
                    />
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.15 },
                        },
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -10 }}
                            className="relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="flex flex-col items-center text-center">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                    className="w-16 h-16 sm:w-20 sm:h-20 mb-6 flex items-center justify-center rounded-full text-white shadow-xl"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <feature.Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                                </motion.div>
                                <h4 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">
                                    {feature.title}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Decorative Badge */}
                            <div 
                                className="absolute top-4 right-4 w-8 h-8 rounded-full opacity-20"
                                style={{ backgroundColor: primaryColor }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Decorative gradient circles */}
            <div 
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
                style={{ backgroundColor: primaryColor }}
            />
            <div 
                className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
                style={{ backgroundColor: primaryColor }}
            />
        </section>
    );
};

export default Trust;

