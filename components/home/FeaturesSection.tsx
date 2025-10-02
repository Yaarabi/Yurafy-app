'use client';

import { motion } from 'framer-motion';
import { MdDescription, MdWeb } from 'react-icons/md';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export default function FeaturesSection() {
    const t = useTranslations('FeaturesSection');

    const features = [
        {
            icon: <MdDescription className="text-blue-600 text-5xl" />,
            title: t('feature1.title'),
            description: t('feature1.description'),
        },
        {
            icon: <MdWeb className="text-green-500 text-5xl" />,
            title: t('feature2.title'),
            description: t('feature2.description'),
        },
        {
            icon: <FaInstagram className="text-pink-500 text-5xl" />,
            title: t('feature3.title'),
            description: t('feature3.description'),
        },
        {
            icon: <FaWhatsapp className="text-teal-500 text-5xl" />,
            title: t('feature4.title'),
            description: t('feature4.description'),
        },
    ];

    return (
        <section className="bg-gradient-to-b from-blue-100 to-white py-24 px-6 md:px-16">
            <div className="max-w-6xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16"
                >
                    {t('title')}
                </motion.h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-transform duration-300"
                        >
                            <div className="mb-6">{feature.icon}</div>
                            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}