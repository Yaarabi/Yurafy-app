'use client';

import { motion } from 'framer-motion';
import { MdCheckCircle } from 'react-icons/md';
import { useTranslations } from 'next-intl';

export default function AboutSection() {
    const t = useTranslations('AboutSection');

    const highlights = [
        t('highlight1'),
        t('highlight2'),
        t('highlight3'),
        t('highlight4'),
    ];

    return (
        <section className="relative overflow-hidden py-24 px-6 md:px-16 bg-blue-100">
            {/* Decorative background shapes */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-[-10%] w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-0 right-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-20" />
            </div>

            <div className="relative max-w-6xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                >
                    {t('title')}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed"
                >
                    {t('description')}
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    {highlights.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-start gap-3 bg-white/60 backdrop-blur-md rounded-xl shadow-sm hover:shadow-md transition p-5"
                        >
                            <MdCheckCircle className="text-blue-600 text-2xl mt-1" />
                            <p className="text-gray-800 text-md">{item}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
