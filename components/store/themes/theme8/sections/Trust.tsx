import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';
import { DollarSign, Truck, CheckCircle } from 'lucide-react';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';

const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#ec4899';
    const surfaceColor = selectedStore.theme?.surfaceColor || '#fad1e6';
    const surfaceGradient = `linear-gradient(160deg, ${surfaceColor} 0%, #ffffff 65%)`;
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
        <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.2 },
                },
            }}
            className="relative py-16 sm:py-20 md:py-24 border-t border-b overflow-hidden"
            style={{ borderColor: `${primaryColor}20`, background: surfaceGradient }}
        >
            {/* Playful Geometric Pattern */}
            <GeometricDecorations type="playful" color={primaryColor} className="opacity-5" />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full border"
                        style={{ 
                            backgroundColor: `${primaryColor}15`,
                            borderColor: `${primaryColor}30`,
                        }}
                    >
                        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                            {getStoreTranslation("whyChooseUs", storeLanguage)}
                        </span>
                    </motion.div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {getStoreTranslation("whyChooseUs", storeLanguage)}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-24 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            variants={itemVariants}
                            className="relative text-center p-6 sm:p-8 rounded-xl bg-white/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                            style={{ 
                                borderColor: `${primaryColor}30`,
                            } as React.CSSProperties}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = primaryColor;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = `${primaryColor}30`;
                            }}
                        >
                            {/* Playful Corner Accent */}
                            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                <div 
                                    className="absolute top-0 right-0 w-0 h-0 border-l-[32px] border-l-transparent border-t-[32px] transition-all duration-300 group-hover:border-t-[40px] group-hover:border-l-[40px]"
                                    style={{ borderTopColor: primaryColor }}
                                ></div>
                            </div>
                            
                            <div 
                                className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl mb-4 sm:mb-6 relative z-10"
                                style={{ backgroundColor: `${primaryColor}15` }}
                            >
                                <feature.Icon 
                                    className="w-7 h-7 sm:w-8 sm:h-8"
                                    style={{ color: primaryColor }}
                                />
                            </div>
                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h4>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Trust;

