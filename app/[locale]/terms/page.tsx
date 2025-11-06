"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ArrowLeft, Shield, FileText } from "lucide-react";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function TermsPage() {
    const t = useTranslations("Terms");
    const params = useParams();
    const locale = params.locale || 'en';

    const sections = [
        {
            title: t("section1.title"),
            content: t("section1.content"),
        },
        {
            title: t("section2.title"),
            content: t("section2.content"),
        },
        {
            title: t("section3.title"),
            content: t("section3.content"),
        },
        {
            title: t("section4.title"),
            content: t("section4.content"),
        },
        {
            title: t("section5.title"),
            content: t("section5.content"),
        },
    ];

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
                <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <Link
                        href={`/${locale}/resources`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Resources
                    </Link>
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-10 h-10 text-blue-600" />
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 text-blue-600">
                            {t("title")}
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 mb-4">
                        {t("lastUpdated")}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        {t("description")}
                    </p>
                </motion.div>

                {/* Terms Content */}
                <div className="space-y-8">
                    {sections.map((section, i) => (
                        <motion.section
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {section.title}
                                </h2>
                            </div>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {section.content}
                            </div>
                        </motion.section>
                    ))}
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center p-8 bg-blue-600 rounded-2xl text-white"
                >
                    <h3 className="text-2xl font-bold mb-4">{t("questions.title")}</h3>
                    <p className="mb-6 text-blue-100">{t("questions.description")}</p>
                    <Link
                        href={`/${locale}/support`}
                        className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        {t("questions.button")}
                    </Link>
                </motion.div>
            </div>
            </div>
            <Footer />
        </>
    );
}

