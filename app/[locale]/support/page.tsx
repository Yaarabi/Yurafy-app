"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageCircle, Mail, Phone, Clock } from "lucide-react";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function SupportPage() {
    const t = useTranslations("Support");
    const params = useParams();
    const locale = params.locale || 'en';

    const supportOptions = [
        {
            icon: MessageCircle,
            title: t("chat.title"),
            description: t("chat.description"),
            action: t("chat.action"),
            link: `#`,
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: Mail,
            title: t("email.title"),
            description: t("email.description"),
            action: t("email.action"),
            link: "mailto:aarabiiyoussef@gmail.com",
            color: "from-blue-500 to-blue-600",
        },
        {
            icon: Phone,
            title: t("phone.title"),
            description: t("phone.description"),
            action: t("phone.action"),
            link: "https://wa.me/+212716413605",
            color: "from-green-500 to-emerald-500",
        },
    ];

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <Link
                        href={`/${locale}/resources`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Resources
                    </Link>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 text-blue-600">
                        {t("title")}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {t("description")}
                    </p>
                </motion.div>

                {/* Support Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {supportOptions.map((option, i) => {
                        const Icon = option.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-400 text-center"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center mx-auto mb-6`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {option.title}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {option.description}
                                </p>
                                <Link
                                    href={option.link}
                                    className={`inline-block px-6 py-3 bg-gradient-to-r ${option.color} text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                                >
                                    {option.action}
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Support Hours */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">{t("hours.title")}</h3>
                    </div>
                    <p className="text-gray-600">{t("hours.description")}</p>
                </motion.div>
            </div>
            </div>
            <Footer />
        </>
    );
}

