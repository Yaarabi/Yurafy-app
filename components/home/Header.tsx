"use client";

import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocaleSwitcher from './LocaleSwitcher';

export default function Header() {
    const t = useTranslations('HeroSection');
    const router = useRouter();
    const params = useParams();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogin = () => {
        const locale = params.locale || 'en';
        router.push(`/${locale}/login`);
        setMobileMenuOpen(false);
    };

    const handleSignup = () => {
        const locale = params.locale || 'en';
        router.push(`/${locale}/signup`);
        setMobileMenuOpen(false);
    };

    const handleHome = () => {
        const locale = params.locale || 'en';
        router.push(`/${locale}`);
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
            {/* Geometric background decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Hexagon pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" />
                    </svg>
                </div>
                <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#0ea5e9" />
                    </svg>
                </div>
                
                {/* Circuit nodes */}
                <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-blue-600/30 rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-blue-600/30 rounded-full"></div>
                
                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                    <line x1="25%" y1="50%" x2="50%" y2="50%" stroke="#0ea5e9" strokeWidth="1" />
                    <line x1="75%" y1="50%" x2="50%" y2="50%" stroke="#0ea5e9" strokeWidth="1" />
                </svg>
                
                {/* Y shape for Yurafy */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 opacity-5 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d="M50,10 L50,50 L30,70 L50,50 L70,70" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                    </svg>
                </div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <button
                        onClick={handleHome}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity z-10"
                    >
                        <Image
                            src="/logo.png"
                            alt={t('logoAlt')}
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                        <span className="font-semibold text-lg sm:text-xl text-gray-900">Yurafy</span>
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-3 z-10">
                        <LocaleSwitcher />
                        <button
                            onClick={handleLogin}
                            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                        >
                            <LogIn className="w-4 h-4" />
                            <span className="hidden lg:inline">{t('login')}</span>
                        </button>
                        <button
                            onClick={handleSignup}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-md hover:shadow-lg"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden lg:inline">{t('signup')}</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition z-10"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden mt-4 pt-4 border-t border-gray-200 overflow-hidden"
                        >
                            <div className="flex flex-col gap-3 pb-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 font-medium">Language</span>
                                    <LocaleSwitcher />
                                </div>
                                <button
                                    onClick={handleLogin}
                                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition text-sm font-medium w-full justify-center"
                                >
                                    <LogIn className="w-4 h-4" />
                                    {t('login')}
                                </button>
                                <button
                                    onClick={handleSignup}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium w-full justify-center shadow-md"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    {t('signup')}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}

