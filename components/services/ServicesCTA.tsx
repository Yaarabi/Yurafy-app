"use client";

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ServicesCTAProps {
    onRequestQuote: () => void;
}

export default function ServicesCTA({ onRequestQuote }: ServicesCTAProps) {
    const t = useTranslations('services');

    return (
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-2xl p-12 text-white shadow-2xl"
                style={{ background: 'linear-gradient(to right, var(--brand-blue), #3730a3)' }}
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {t('cta.title')}
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                    {t('cta.subtitle')}
                </p>
                <button
                    onClick={onRequestQuote}
                    className="bg-white hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    style={{ color: 'var(--brand-blue)' }}
                >
                    {t('cta.button')}
                </button>
            </motion.div>
        </section>
    );
}
