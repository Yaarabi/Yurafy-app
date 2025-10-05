'use client';

import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaInstagram, FaWhatsapp, FaChartLine } from 'react-icons/fa';
import { LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';

export default function HeroSection() {
    const t = useTranslations('HeroSection');
    const router = useRouter();
    const params = useParams();

    const handleLogin = () => router.push(`/${params.locale}/login`);
    const handleSignup = () => router.push(`/${params.locale}/signup`);
    const handleGetStarted = () => router.push(`/${params.locale}/signup`);
    const handleLearnMore = () => router.push(`/${params.locale}#how-it-works`);

    return (
        <section className="bg-gradient-to-br from-white to-blue-100 py-16 px-4 sm:px-8 md:px-12 lg:px-16 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col min-h-[80vh]">
                {/* Top Bar */}
                <div className="flex flex-wrap justify-end items-center gap-3 mb-10">
                    <LocaleSwitcher />

                    <button
                        onClick={handleLogin}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition text-sm sm:text-base"
                    >
                        <LogIn className="w-5 h-5" />
                        {t('login')}
                    </button>

                    <button
                        onClick={handleSignup}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition shadow text-sm sm:text-base"
                    >
                        <UserPlus className="w-5 h-5" />
                        {t('signup')}
                    </button>
                </div>

                {/* Hero Content */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 flex-1">
                    {/* Text Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 text-center md:text-left"
                    >
                        <div className="flex flex-col items-center md:items-start mb-6">
                            <Image
                                src="/logo.png"
                                alt={t('logoAlt')}
                                width={100}
                                height={50}
                                className="object-contain mb-3"
                            />
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                {t('title')}
                            </h1>
                        </div>

                        <p className="text-base sm:text-lg text-gray-700 mb-8 max-w-xl mx-auto md:mx-0">
                            {t('subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <button
                                onClick={handleGetStarted}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                {t('cta.getStarted')}
                            </button>
                            <button
                                onClick={handleLearnMore}
                                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition font-medium"
                            >
                                {t('cta.learnMore')}
                            </button>
                        </div>
                    </motion.div>

                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 w-full order-last md:order-none"
                    >
                        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
                            <Image
                                src="/uihome.png"
                                alt={t('dashboardAlt')}
                                fill
                                className="object-contain rounded-xl shadow-lg"
                            />
                            <div className="absolute bottom-4 left-4 flex gap-4 text-2xl text-blue-600">
                                <FaInstagram className="hover:scale-110 transition-transform" />
                                <FaWhatsapp className="hover:scale-110 transition-transform" />
                                <FaChartLine className="hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
