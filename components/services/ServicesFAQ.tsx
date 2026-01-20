"use client";

import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export default function ServicesFAQ({ locale }: { locale: string }) {
    const t = useTranslations('services');
    const isArabic = locale === 'ar';
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        { q: t('faq.items.q1.q'), a: t('faq.items.q1.a') },
        { q: t('faq.items.q2.q'), a: t('faq.items.q2.a') },
        { q: t('faq.items.q3.q'), a: t('faq.items.q3.a') },
        { q: t('faq.items.q4.q'), a: t('faq.items.q4.a') },
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="relative py-16 bg-gradient-to-b from-white to-blue-50 overflow-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
            {/* Decorative shapes */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.06, scale: 1, rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-8 right-1/6 w-20 h-20 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.3" />
                </svg>
            </motion.div>

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <HelpCircle className="w-10 h-10" style={{ color: 'var(--brand-blue)' }} />
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900" role="heading" aria-level={2}>{t('faq.title')}</h2>
                    </div>
                    <p className="text-lg text-gray-600">{t('projectsSubtitle') || ''}</p>
                </motion.div>

                <div className="space-y-4 mb-6">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-[var(--brand-blue)] transition-all duration-300"
                        >
                            <button
                                onClick={() => toggleFAQ(i)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h3 className="text-lg font-bold text-gray-900 pr-4">{faq.q}</h3>
                                <ChevronDown
                                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                                    style={{ color: 'var(--brand-blue)' }}
                                />
                            </button>

                            {openIndex === i && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 text-gray-600 leading-relaxed"
                                >
                                    {faq.a}
                                </motion.p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
