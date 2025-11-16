'use client';

import { motion } from 'framer-motion';
import { Store, MessageCircle, Bot, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

export default function HowItWorks() {
    const t = useTranslations('HowItWorks');
    const router = useRouter();
    const params = useParams();

    const steps = [
        {
            icon: Store,
            title: t('step1.title'),
            description: t('step1.description'),
            color: "text-blue-600",
        },
        {
            icon: MessageCircle,
            title: t('step2.title'),
            description: t('step2.description'),
            color: "text-blue-600",
        },
        {
            icon: Bot,
            title: t('step3.title'),
            description: t('step3.description'),
            color: "text-blue-600",
        },
        {
            icon: Zap,
            title: t('step4.title'),
            description: t('step4.description'),
            color: "text-blue-600",
        },
    ];

    const handleGetStarted = () => {
        const locale = params.locale || 'en';
        router.push(`/${locale}/signup`);
    };

    return (
        <section id='how-it-works' className="relative bg-blue-50 py-20 px-6 md:px-16 overflow-hidden">
            {/* Geometric shapes - Smart/tech inspired */}
            {/* Hexagon pattern */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.08, scale: 1, rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/5 w-20 h-20 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.3" />
                </svg>
            </motion.div>
            
            {/* Circuit nodes */}
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-600/40 rounded-full"></div>
            <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-blue-600/40 rounded-full"></div>
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                <line x1="25%" y1="33%" x2="50%" y2="50%" stroke="#0ea5e9" strokeWidth="2" />
                <line x1="75%" y1="67%" x2="50%" y2="50%" stroke="#0ea5e9" strokeWidth="2" />
            </svg>
            
            {/* Y shape for Yurafy */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06 }}
                transition={{ duration: 2, delay: 0.3 }}
                className="absolute bottom-1/4 right-1/6 w-24 h-24 pointer-events-none"
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
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                >
                    {t('title')}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 mb-12 text-lg"
                >
                    {t('subtitle')}
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.2 }}
                                className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition"
                            >
                                <div className={`mb-4 flex justify-center ${step.color}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                                <p className="text-gray-600 text-sm">{step.description}</p>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                >
                    <button
                        onClick={handleGetStarted}
                        className="text-white px-8 py-3 rounded-lg hover:opacity-90 transition font-semibold shadow-lg"
                        style={{ backgroundColor: 'var(--brand-blue)' }}
                    >
                        {t('cta')}
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
