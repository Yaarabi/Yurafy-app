import React from 'react';
import { FaDollarSign, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
    hidden: { y: 40, opacity: 0, rotate: -5 },
    visible: { y: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 100 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#db2777';

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
            className="py-24 bg-white relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-1/4 h-full"
                style={{ background: `linear-gradient(135deg, ${primaryColor}10, transparent)` }}
            ></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            variants={itemVariants}
                            className="bg-white border-4 rounded-none shadow-2xl p-10 text-center hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                            style={{ borderColor: primaryColor }}
                        >
                            <div 
                                className="inline-flex items-center justify-center w-20 h-20 mb-6 border-4"
                                style={{ 
                                    backgroundColor: primaryColor,
                                    borderColor: primaryColor
                                }}
                            >
                                <feature.Icon className="text-2xl text-white" />
                            </div>
                            <h4 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">{feature.title}</h4>
                            <p className="text-gray-600 font-medium leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Trust;

