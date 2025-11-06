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
        <section id="about" className="relative overflow-hidden py-24 px-6 md:px-16 bg-blue-100">
            {/* Decorative background shapes */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-[-10%] w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-0 right-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-20" />
            </div>
            
            {/* Geometric shapes - Smart/tech inspired */}
            {/* Hexagon pattern */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.08, scale: 1, rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 right-1/4 w-20 h-20 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.3" />
                </svg>
            </motion.div>
            
            {/* Circuit nodes */}
            <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-blue-600/40 rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-blue-600/40 rounded-full"></div>
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                <line x1="33%" y1="33%" x2="50%" y2="50%" stroke="#0ea5e9" strokeWidth="2" />
                <line x1="67%" y1="67%" x2="50%" y2="50%" stroke="#0ea5e9" strokeWidth="2" />
            </svg>
            
            {/* Y shape for Yurafy */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06 }}
                transition={{ duration: 2 }}
                className="absolute bottom-1/4 left-1/5 w-32 h-32 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,10 L50,50 L30,70 L50,50 L70,70" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                </svg>
            </motion.div>

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
