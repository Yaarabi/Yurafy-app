import React from 'react';
import { FaDollarSign, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#ca8a04';

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
            className="py-20 bg-amber-50"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            variants={itemVariants}
                            className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[var(--color-primary)]"
                        >
                            <div 
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 border-4"
                                style={{ 
                                    backgroundColor: `${primaryColor}15`,
                                    borderColor: primaryColor
                                }}
                            >
                                <feature.Icon 
                                    className="text-2xl"
                                    style={{ color: primaryColor }}
                                />
                            </div>
                            <h4 className="text-xl font-bold italic text-gray-900 mb-3">{feature.title}</h4>
                            <p className="text-gray-600 leading-relaxed font-light">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Trust;

