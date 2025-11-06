"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { BookOpen, FileText, HelpCircle, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function ResourcesPage() {
    const t = useTranslations("Resources");
    const params = useParams();
    const locale = params.locale || 'en';

    const resources = [
        {
            icon: BookOpen,
            title: t("blog.title"),
            description: t("blog.description"),
            link: `/${locale}/blog`,
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: FileText,
            title: t("support.title"),
            description: t("support.description"),
            link: `/${locale}/support`,
            color: "from-blue-500 to-blue-600",
        },
        {
            icon: Shield,
            title: t("terms.title"),
            description: t("terms.description"),
            link: `/${locale}/terms`,
            color: "from-blue-500 to-blue-600",
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
                        href={`/${locale}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 text-blue-600">
                        {t("title")}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {t("description")}
                    </p>
                </motion.div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {resources.map((resource, i) => {
                        const Icon = resource.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-400"
                            >
                                <Link href={resource.link} className="block">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${resource.color} flex items-center justify-center mb-6`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                        {resource.title}
                                    </h2>
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {resource.description}
                                    </p>
                                    <span className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                                        Learn more →
                                    </span>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            </div>
            <Footer />
        </>
    );
}

