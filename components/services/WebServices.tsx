"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag, Layout, Globe, Smartphone, Database, Zap } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

interface ServiceItem {
    id: string;
    key: string;
    icon: React.ComponentType<any>;
}

const services: ServiceItem[] = [
    { id: '1', key: 'wordpress', icon: Globe },
    { id: '2', key: 'ecommerce', icon: ShoppingBag },
    { id: '3', key: 'uiux', icon: Layout },
    { id: '4', key: 'responsive', icon: Smartphone },
    { id: '5', key: 'customWebApps', icon: Database },
    { id: '6', key: 'performanceSeo', icon: Zap },
];

// Explicitly type as Variants to satisfy TypeScript
const cardVariants: Variants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", bounce: 0.3, duration: 0.6 }
    },
};

const Services: React.FC = () => {
    const t = useTranslations('services');
    return (
        <section id="services" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
            <h2 className="text-base text-sky-900 font-semibold tracking-wide uppercase">{t('web.title')}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">
                {t('web.subtitle')}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-sky-900 mx-auto">
                {t('web.description')}
            </p>
            </div>

            <motion.div
            className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.2 }}
            >
            {services.map((service) => (
                <motion.div
                key={service.id}
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                className="pt-6"
                >
                <div className="flow-root bg-sky-50 dark:bg-gray-800 rounded-lg px-6 pb-8 h-full shadow-md hover:shadow-xl transition-shadow duration-300 border border-sky-100 dark:border-gray-700">
                    <div className="-mt-6 flex flex-col items-center text-center">
                    <span className="inline-flex items-center justify-center p-3 bg-sky-500 rounded-md shadow-lg">
                        <service.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                    <h3 className="mt-8 text-lg font-semibold text-sky-900 dark:text-white tracking-tight">
                        {t(`web.items.${service.key}.title`)}
                    </h3>
                    <p className="mt-5 text-base text-sky-600 dark:text-sky-300">
                        {t(`web.items.${service.key}.description`)}
                    </p>
                    </div>
                </div>
                </motion.div>
            ))}
            </motion.div>
        </div>
        </section>
    );
};

export default Services;
