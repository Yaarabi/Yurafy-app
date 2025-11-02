import React from 'react';
import { ShieldCheckIcon, TruckIcon, CheckCircleIcon } from '@/components/store/components/icons';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#8B5CF6';

    const features = [
        {
            Icon: ShieldCheckIcon,
            title: 'Secure Payments',
            description: 'Your transactions are safe with our encrypted checkout process.',
        },
        {
            Icon: TruckIcon,
            title: 'Fast Shipping',
            description: 'We ensure your order gets to you as quickly as possible.',
        },
        {
            Icon: CheckCircleIcon,
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
            className="py-20 bg-white"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            variants={itemVariants}
                            className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl p-10 text-center hover:shadow-2xl transition-all duration-300 border-2"
                            style={{ borderColor: `${primaryColor}30` }}
                        >
                            <div 
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <feature.Icon className="h-10 w-10 text-white" />
                            </div>
                            <h4 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h4>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Trust;

