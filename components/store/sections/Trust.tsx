import React from 'react';
import { CashIcon, TruckIcon, QualityIcon } from '../components/icons';
import { motion, Variants } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
};

// FIX: Explicitly type itemVariants with Variants from framer-motion to fix type inference issue.
const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
        },
    },
};


const Trust: React.FC = () => {
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
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="bg-gray-50 py-16"
        >
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {features.map((feature, index) => (
                        <motion.div key={index} variants={itemVariants} className="flex flex-col items-center">
                            <feature.Icon className="h-12 w-12 text-[var(--color-primary)] mb-4" />
                            <h4 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h4>
                            <p className="text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Trust;