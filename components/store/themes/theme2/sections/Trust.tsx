import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';
import { DollarSign, Truck, CheckCircle } from 'lucide-react';
import { getStoreTranslation } from '../../../utils/translations';

const itemVariants: Variants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#f43f5e';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#fff1f5';
    const surfaceGradient = `linear-gradient(170deg, ${surfaceColor} 0%, #ffffff 70%)`;
    const storeLanguage = selectedStore.language || 'en';
    const isArabic = storeLanguage.toLowerCase().startsWith('ar');

    const features = [
        {
            Icon: DollarSign,
            title: getStoreTranslation("cashOnDelivery", storeLanguage),
            description: getStoreTranslation("cashOnDeliveryDesc", storeLanguage),
            gradient: 'from-blue-500 to-blue-600',
        },
        {
            Icon: Truck,
            title: getStoreTranslation("fastShipping", storeLanguage),
            description: getStoreTranslation("fastShippingDesc", storeLanguage),
            gradient: 'from-green-500 to-green-600',
        },
        {
            Icon: CheckCircle,
            title: getStoreTranslation("highQuality", storeLanguage),
            description: getStoreTranslation("highQualityDesc", storeLanguage),
            gradient: 'from-purple-500 to-purple-600',
        },
    ];

    return (
        <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden" style={{ background: surfaceGradient }} dir={isArabic ? 'rtl' : undefined}>
            {/* Decorative circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 blur-3xl"
                    style={{ backgroundColor: primaryColor }}
                />
                <div 
                    className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl"
                    style={{ backgroundColor: primaryColor }}
                />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`text-center mb-12 sm:mb-16`}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 sm:mb-6"
                        style={{ 
                            backgroundColor: `${primaryColor}15`,
                            color: primaryColor 
                        }}
                    >
                        {getStoreTranslation("benefits", storeLanguage) || "BENEFITS"}
                    </motion.div>
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6">
                        {getStoreTranslation("whyChooseUs", storeLanguage)}
                    </h2>
                    
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`h-1 w-20 sm:w-24 mx-auto rounded-full`}
                        style={{ backgroundColor: primaryColor }}
                    />
                </motion.div>
                
                {/* Features Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.15 },
                        },
                    }}
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ${isArabic ? 'text-right' : ''}`}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -8 }}
                            className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                            {/* Icon container */}
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-4 sm:mb-6 shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <feature.Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </motion.div>
                            
                            {/* Content */}
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                            
                            {/* Hover effect - bottom border */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                                style={{ backgroundColor: primaryColor }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
                
                {/* Bottom CTA */}
                {/* Bottom CTA (trust message removed as requested) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className={`text-center mt-12 sm:mt-16`}
                >
                    <motion.a
                        href="#products"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold shadow-lg hover:shadow-xl transition-all"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {getStoreTranslation("shopNow", storeLanguage)}
                        <span className="text-xl">{isArabic ? '←' : '→'}</span>
                    </motion.a>
                </motion.div>
            </div>
        </div>
    );
};

export default Trust;

