import React from 'react';
import { CashIcon, TruckIcon, FashionIcon } from '@/components/store/components/icons';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#4b5563';

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
            Icon: FashionIcon,
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
                    transition: { staggerChildren: 0.2 },
                },
            }}
            className="py-20 bg-white border-t border-b border-gray-200"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            variants={itemVariants}
                            className="text-center"
                        >
                            <div 
                                className="inline-flex items-center justify-center w-16 h-16 mb-8 border-2"
                                style={{ 
                                    borderColor: primaryColor,
                                    color: primaryColor 
                                }}
                            >
                                <feature.Icon className="h-8 w-8" />
                            </div>
                            <h4 className="text-2xl font-light text-gray-900 mb-4">{feature.title}</h4>
                            <p className="text-gray-500 font-light leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Trust;

