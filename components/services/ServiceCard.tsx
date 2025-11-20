"use client";

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { FaShoppingCart, FaWhatsapp, FaTruck, FaBolt, FaRobot } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FaShoppingCart,
    FaWhatsapp,
    FaTruck,
    FaBolt,
    FaRobot,
};

interface ServiceCardProps {
    service: {
        id: string;
        type: string;
        description: string;
        features: string[];
        icon: string;
        color: string;
        popular?: boolean;
    };
    index: number;
    isArabic: boolean;
    onGetStarted: (serviceType: string) => void;
}

export default function ServiceCard({ service, index, isArabic, onGetStarted }: ServiceCardProps) {
    const t = useTranslations('services');
    const IconComponent = iconMap[service.icon];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
        >
            {service.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        ⭐ {t('popular')}
                    </span>
                </div>
            )}
            <div className="h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[var(--brand-blue)]">
                <div className={`bg-gradient-to-r ${service.color} p-6 text-white`}>
                    {IconComponent && <IconComponent className="w-12 h-12 mb-4" />}
                    <h3 className="text-2xl font-bold mb-2">{service.type}</h3>
                    <p className="text-white/90 text-sm">{service.description}</p>
                </div>
                <div className="p-6">
                    <ul className="space-y-3 mb-6">
                        {service.features.map((feature, idx) => (
                            <li key={idx} className={`flex items-start gap-2 text-gray-700 dark:text-gray-300 ${isArabic ? 'text-right' : ''}`}>
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => onGetStarted(service.type)}
                        className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group hover:opacity-90"
                        style={{ background: 'linear-gradient(to right, var(--brand-blue), #1e40af)' }}
                    >
                        {t('getStarted')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
