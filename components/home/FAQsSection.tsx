"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function FAQsSection() {
    const t = useTranslations("FAQs");
    const params = useParams();
    const locale = params.locale || 'en';
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: t("faq1.question"),
            answer: t("faq1.answer"),
        },
        {
            question: t("faq2.question"),
            answer: t("faq2.answer"),
        },
        {
            question: t("faq3.question"),
            answer: t("faq3.answer"),
        },
        {
            question: t("faq4.question"),
            answer: t("faq4.answer"),
        },
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="relative py-20 bg-gradient-to-b from-gray-50 to-blue-50 overflow-hidden">
            {/* Geometric shapes - Smart/tech inspired */}
            {/* Hexagon pattern */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.08, scale: 1, rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 right-1/5 w-20 h-20 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" opacity="0.3" />
                </svg>
            </motion.div>
            
            {/* Circuit nodes */}
            <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-blue-600/40 rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-blue-600/40 rounded-full"></div>
            
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
                className="absolute bottom-1/4 left-1/6 w-24 h-24 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,10 L50,50 L30,70 L50,50 L70,70" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                </svg>
            </motion.div>
            
            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <HelpCircle className="w-10 h-10 text-blue-600" />
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">
                            {t("title")}
                        </h2>
                    </div>
                    <p className="text-xl text-gray-600">
                        {t("description")}
                    </p>
                </motion.div>

                <div className="space-y-4 mb-8">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-blue-400 transition-all duration-300"
                        >
                            <button
                                onClick={() => toggleFAQ(i)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h3 className="text-lg font-bold text-gray-900 pr-4">
                                    {faq.question}
                                </h3>
                                <ChevronDown
                                    className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                                        openIndex === i ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openIndex === i && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 text-gray-600 leading-relaxed"
                                >
                                    {faq.answer}
                                </motion.p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

