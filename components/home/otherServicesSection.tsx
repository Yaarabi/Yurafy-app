'use client';

import { motion } from 'framer-motion';
import { FaLaptopCode, FaRobot, FaCogs } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export default function ServicesSection() {
    const t = useTranslations('OtherServicesSection');

    const services = [
        {
            icon: <FaLaptopCode className="text-indigo-500 text-5xl" />,
            title: t('service1.title'),
            description: t('service1.description'),
        },
        {
            icon: <FaRobot className="text-pink-500 text-5xl" />,
            title: t('service2.title'),
            description: t('service2.description'),
        },
        {
            icon: <FaCogs className="text-green-500 text-5xl" />,
            title: t('service3.title'),
            description: t('service3.description'),
        },
    ];

    return (
        <section className="bg-gradient-to-b from-white to-blue-100 py-24 px-6 md:px-16">
            <div className="max-w-6xl mx-auto text-center">
                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                >
                    {t('title')}
                </motion.h2>

                {/* Optional subtitle */}
                <p className="text-gray-700 mb-12 text-lg md:text-xl">
                    {t('subtitle')}
                </p>

                {/* Services cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
                    {services.map((service, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.2 }}
                            className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-transform duration-300"
                        >
                            <div className="mb-6">{service.icon}</div>
                            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                                {service.title}
                            </h3>
                            <p className="text-gray-600 text-sm md:text-base">{service.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action */}
                <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <a
                        href="#contact"
                        className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-700 transition"
                    >
                        {t('cta.contact')}
                    </a>
                </motion.div>
            </div>
        </section>
    );
}