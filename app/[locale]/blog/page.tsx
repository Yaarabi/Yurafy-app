"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function BlogPage() {
    const t = useTranslations("Blog");
    const params = useParams();
    const locale = params.locale || 'en';

    const blogPosts = [
        {
            id: 1,
            title: t("post1.title"),
            excerpt: t("post1.excerpt"),
            date: "2025-01-15",
            author: "Yurafy Team",
            category: "Product Updates",
        },
        {
            id: 2,
            title: t("post2.title"),
            excerpt: t("post2.excerpt"),
            date: "2025-01-10",
            author: "Yurafy Team",
            category: "Best Practices",
        },
        {
            id: 3,
            title: t("post3.title"),
            excerpt: t("post3.excerpt"),
            date: "2025-01-05",
            author: "Yurafy Team",
            category: "Tutorials",
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
                        <BookOpen className="w-10 h-10 text-blue-600" />
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 text-blue-600">
                            {t("title")}
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl">
                        {t("description")}
                    </p>
                </motion.div>

                {/* Blog Posts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post, i) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-400 cursor-pointer"
                        >
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                    {post.category}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                                {post.title}
                            </h2>
                            <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 border-t pt-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {post.author}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(post.date).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* Empty State */}
                {blogPosts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">{t("empty")}</p>
                    </motion.div>
                )}
            </div>
            </div>
            <Footer />
        </>
    );
}

