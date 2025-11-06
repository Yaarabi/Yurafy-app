import React from 'react';
import { FaDollarSign, FaTruck, FaShieldAlt } from 'react-icons/fa';
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
            Icon: FaDollarSign,
            title: 'Pay on Delivery',
            description: 'Pay when you receive your order. No upfront payment required.',
        },
        {
            Icon: FaTruck,
            title: 'Fast Shipping',
            description: 'We ensure your order gets to you as quickly as possible.',
        },
        {
            Icon: FaShieldAlt,
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
                                <feature.Icon className="text-2xl" />
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

