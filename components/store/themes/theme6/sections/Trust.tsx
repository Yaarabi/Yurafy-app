import React from 'react';
import { CashIcon, TruckIcon, QualityIcon } from '@/components/store/components/icons';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#3B82F6';

    const features = [
        {
            Icon: CashIcon,
            title: 'Pay on Delivery',
            description: 'Pay when you receive your order. No upfront payment required.',
        },
        {
            Icon: TruckIcon,
            title: 'Fast Shipping',
            description: 'We ensure your order gets to you as quickly as possible.',
        },
        {
            Icon: QualityIcon,
            title: 'Quality Guaranteed',
            description: 'We stand behind the quality of our products, 100% satisfaction.',
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
                    transition: { staggerChildren: 0.15 },
                },
            }}
            className="py-16 bg-gradient-to-br from-gray-50 to-white"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            variants={itemVariants}
                            className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                        >
                            <div 
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                                style={{ backgroundColor: `${primaryColor}15` }}
                            >
                                <feature.Icon 
                                    className="h-8 w-8"
                                    style={{ color: primaryColor }}
                                />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                            <p className="text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Trust;

