import React from 'react';
import { ShieldCheckIcon, TruckIcon, CheckCircleIcon } from '@/components/store/components/icons';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#0891b2';

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
            className="py-20 bg-white border-t border-b border-gray-200"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-block px-4 py-2 mb-4 rounded-full"
                        style={{ backgroundColor: `${primaryColor}15` }}
                    >
                        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                            Why Choose Us
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            variants={itemVariants}
                            className="text-center p-8 rounded-xl border-2 border-gray-200 hover:border-[var(--color-primary)] hover:shadow-xl transition-all duration-300"
                        >
                            <div 
                                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6"
                                style={{ backgroundColor: `${primaryColor}15` }}
                            >
                                <feature.Icon 
                                    className="h-8 w-8"
                                    style={{ color: primaryColor }}
                                />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Trust;

