'use client';

import { motion } from 'framer-motion';
import { Store, MessageCircle, Bot, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FeaturesSection() {
    const t = useTranslations('FeaturesSection');

    const features = [
        {
            icon: Store,
            title: t('feature1.title'),
            description: t('feature1.description'),
            color: "text-blue-600",
        },
        {
            icon: MessageCircle,
            title: t('feature2.title'),
            description: t('feature2.description'),
            color: "text-blue-600",
        },
        {
            icon: Bot,
            title: t('feature3.title'),
            description: t('feature3.description'),
            color: "text-blue-600",
        },
        {
            icon: Sparkles,
            title: t('feature4.title'),
            description: t('feature4.description'),
            color: "text-blue-600",
        },
    ];

    return (
        <section id="features" className="relative bg-gradient-to-b from-white to-blue-50 py-24 px-6 md:px-16 overflow-hidden">
            {/* Geometric shapes - Smart/tech inspired */}
            {/* Hexagon pattern */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.08, scale: 1, rotate: [360, 0] }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/3 left-1/6 w-20 h-20 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.3" />
                </svg>
            </motion.div>
            
            {/* Circuit nodes */}
            <div className="absolute top-1/4 right-1/4 w-2.5 h-2.5 bg-blue-600/30 rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/4 w-2.5 h-2.5 bg-blue-600/30 rounded-full"></div>
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-8 pointer-events-none">
                <line x1="75%" y1="25%" x2="50%" y2="50%" stroke="#0ea5e9" strokeWidth="2" />
                <line x1="25%" y1="75%" x2="50%" y2="50%" stroke="#0ea5e9" strokeWidth="2" />
            </svg>
            
            {/* Y shape for Yurafy */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.06, scale: 1 }}
                transition={{ duration: 2, delay: 0.4 }}
                className="absolute top-1/2 right-1/5 w-20 h-20 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,10 L50,50 L30,70 L50,50 L70,70" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                </svg>
            </motion.div>
            
            <div className="relative z-10 max-w-6xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
                >
                    {t('title')}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 mb-16 text-lg"
                >
                    {t('subtitle')}
                </motion.p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-transform duration-300"
                            >
                                <div className={`mb-6 flex justify-center ${feature.color}`}>
                                    <Icon className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
