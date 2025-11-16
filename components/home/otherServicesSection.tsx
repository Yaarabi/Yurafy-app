'use client';

import { motion } from 'framer-motion';
import { Code, Globe, Smartphone, Palette, Zap, Shield } from 'lucide-react';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

export default function ServicesSection() {
    const t = useTranslations('OtherServicesSection');
    const locale = useLocale();
    const messages = useMessages() as any;
    const router = useRouter();
    const params = useParams();
    const isRTL = locale === 'ar';

    const getFeatures = (serviceKey: 'service1' | 'service2' | 'service3'): string[] => {
        const base = messages?.OtherServicesSection?.[serviceKey]?.features;
        if (!base || typeof base !== 'object') return [];
        return Object.keys(base)
            .sort((a, b) => Number(a) - Number(b))
            .map((k) => String(base[k]));
    };

    const services = [
        {
            icon: Code,
            title: t('service1.title'),
            description: t('service1.description'),
            features: getFeatures('service1'),
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50',
        },
        {
            icon: Globe,
            title: t('service2.title'),
            description: t('service2.description'),
            features: getFeatures('service2'),
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            icon: Smartphone,
            title: t('service3.title'),
            description: t('service3.description'),
            features: getFeatures('service3'),
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50',
        },
    ];

    const handleContact = () => {
        const locale = params.locale || 'en';
        router.push(`/${locale}/services`);
    };

    return (
        <section id="services" className="relative overflow-hidden py-24 px-6 md:px-16 bg-gradient-to-b from-blue-50 via-white to-blue-50">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            {/* Geometric shapes - Smart/tech inspired */}
            {/* Hexagon pattern */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.08, scale: 1, rotate: [0, 360] }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/3 right-1/6 w-24 h-24 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.3" />
                </svg>
            </motion.div>
            
            {/* Circuit nodes */}
            <div className="absolute top-1/4 left-1/4 w-2.5 h-2.5 bg-blue-600/30 rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-2.5 h-2.5 bg-blue-600/30 rounded-full"></div>
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-8 pointer-events-none">
                <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="#0ea5e9" strokeWidth="2" />
                <line x1="75%" y1="75%" x2="50%" y2="50%" stroke="#0ea5e9" strokeWidth="2" />
            </svg>
            
            {/* Y shape for Yurafy */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06 }}
                transition={{ duration: 2, delay: 0.5 }}
                className="absolute bottom-1/3 left-1/6 w-28 h-28 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,10 L50,50 L30,70 L50,50 L70,70" stroke="#0ea5e9" strokeWidth="2.5" fill="none" />
                </svg>
            </motion.div>
            
            <div className="relative max-w-7xl mx-auto">
                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`text-center mb-16 ${isRTL ? 'rtl' : ''}`}
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 text-blue-600">
                        {t('title')}
                    </h2>
                    <p className="text-gray-700 mb-8 text-lg md:text-xl max-w-3xl mx-auto">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Services cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {services.map((service, i) => {
                        const Icon = service.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className={`relative ${service.bgColor} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-400 group ${isRTL ? 'text-right' : ''}`}
                            >
                                {/* Icon */}
                                <div className={`mb-6 p-4 rounded-2xl bg-gradient-to-br ${service.color} w-fit group-hover:scale-110 transition-transform duration-300 ${isRTL ? 'ml-auto' : ''}`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                
                                {/* Content */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 mb-6 text-base leading-relaxed">
                                    {service.description}
                                </p>

                                {/* Features */}
                                <ul className={`space-y-2 mb-6 ${isRTL ? 'pr-1' : ''}`}>
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className={`flex items-center gap-2 text-sm text-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.color}`}></div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={handleContact}
                                    className={`w-full py-3 rounded-lg font-semibold bg-gradient-to-r ${service.color} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                                >
                                    {t('cta.contact')}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Additional highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
                >
                    {[
                        { icon: Zap, text: t('highlights.fast'), color: 'text-yellow-500' },
                        { icon: Shield, text: t('highlights.secure'), color: 'text-green-500' },
                        { icon: Palette, text: t('highlights.design'), color: 'text-blue-500' },
                    ].map((item, i) => {
                        const ItemIcon = item.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className={`flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                            >
                                <ItemIcon className={`w-6 h-6 ${item.color}`} />
                                <span className="font-semibold text-gray-700">{item.text}</span>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12"
                >
                    <button
                        onClick={handleContact}
                        className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-full font-semibold hover:opacity-90 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
                        style={{ backgroundColor: 'var(--brand-blue)' }}
                    >
                        {t('cta.contact')}
                    </button>
                </motion.div>
            </div>
        </section>
    );
}