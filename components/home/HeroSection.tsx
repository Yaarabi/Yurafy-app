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
    const params = useParams(); // { locale: 'en' | 'fr' | 'ar' }

    const handleLogin = () => {
        router.push(`/${params.locale}/login`);
    };

    const handleSignup = () => {
        router.push(`/${params.locale}/signup`);
    };

    const handleGetStarted = () => {
        router.push(`/${params.locale}/signup`);
    };

    const handleLearnMore = () => {
        router.push(`/${params.locale}#how-it-works`); 
    };

    return (
        <section className="bg-gradient-to-br from-white to-blue-100 py-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
            {/* Top Bar: Language + Auth */}
            <div className="flex justify-end items-center gap-4 mb-8">
            <LocaleSwitcher />

            {/* Login */}
            <button
                onClick={handleLogin}
                className="cursor-pointer flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition"
            >
                <LogIn className="w-5 h-5" />
                {t('login')}
            </button>

            {/* Sign Up */}
            <button
                onClick={handleSignup}
                className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition shadow"
            >
                <UserPlus className="w-5 h-5" />
                {t('signup')}
            </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12">
            {/* Text Content */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1"
            >
                <div className="flex items-center gap-2 mb-6">
                <Image
                    src="/logo.png"
                    alt={t('logoAlt')}
                    width={120}
                    height={60}
                    className="object-contain"
                />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {t('title')}
                </h2>
                </div>

                <p className="text-lg text-gray-700 mb-6">{t('subtitle')}</p>

                <div className="flex gap-4">
                <button
                    onClick={handleGetStarted}
                    className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    {t('cta.getStarted')}
                </button>
                <button
                    onClick={handleLearnMore}
                    className="cursor-pointer border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
                >
                    {t('cta.learnMore')}
                </button>
                </div>
            </motion.div>

            {/* Visual Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex-1"
            >
                <div className="relative w-full h-[400px]">
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
