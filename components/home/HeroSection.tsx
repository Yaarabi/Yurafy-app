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
    const handleLearnMore = () => {
        const element = document.getElementById('how-it-works');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section id="home" className="relative overflow-hidden py-20 px-6 sm:px-10 lg:px-16" style={{ backgroundColor: '#0ea5e9' }}>
            {/* Background decorations */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]"></div>
            
            {/* Geometric shapes - Smart/tech inspired - More visible */}
            {/* Large floating hexagons */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.25, scale: 1, rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-20 right-10 w-40 h-40 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" opacity="0.3" />
                </svg>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.3, scale: 1, rotate: [360, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-20 left-10 w-36 h-36 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" opacity="0.3" />
                </svg>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.2, scale: 1, rotate: [0, -360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/4 w-28 h-28 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" opacity="0.25" />
                </svg>
            </motion.div>
            
            {/* Medium hexagons */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.2, scale: 1, rotate: [360, 0] }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/3 right-1/3 w-24 h-24 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" opacity="0.3" />
                </svg>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.18, scale: 1, rotate: [0, 360] }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/3 left-1/3 w-20 h-20 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" opacity="0.3" />
                </svg>
            </motion.div>
            
            {/* Circuit pattern nodes - More visible */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/60 rounded-full"></div>
            <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-white/60 rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-white/60 rounded-full"></div>
            <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-white/60 rounded-full"></div>
            <div className="absolute top-1/5 right-1/5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
            <div className="absolute bottom-1/5 left-1/5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
            <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="absolute top-1/2 right-1/6 w-2 h-2 bg-white/50 rounded-full"></div>
            
            {/* Connection lines - More visible */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                <line x1="25%" y1="25%" x2="33%" y2="33%" stroke="white" strokeWidth="1.5" />
                <line x1="67%" y1="33%" x2="75%" y2="25%" stroke="white" strokeWidth="1.5" />
                <line x1="75%" y1="75%" x2="67%" y2="67%" stroke="white" strokeWidth="1.5" />
                <line x1="33%" y1="67%" x2="25%" y2="75%" stroke="white" strokeWidth="1.5" />
                <line x1="20%" y1="20%" x2="33%" y2="33%" stroke="white" strokeWidth="1.2" />
                <line x1="80%" y1="80%" x2="67%" y2="67%" stroke="white" strokeWidth="1.2" />
                <line x1="67%" y1="50%" x2="50%" y2="50%" stroke="white" strokeWidth="1.2" />
                <line x1="33%" y1="50%" x2="50%" y2="50%" stroke="white" strokeWidth="1.2" />
                <line x1="50%" y1="25%" x2="50%" y2="50%" stroke="white" strokeWidth="1" />
                <line x1="50%" y1="75%" x2="50%" y2="50%" stroke="white" strokeWidth="1" />
            </svg>
            
            {/* Y letter geometric shapes - More visible */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 0.15, y: 0 }}
                transition={{ duration: 2, delay: 0.5 }}
                className="absolute top-1/2 right-1/4 w-48 h-48 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,10 L50,50 L30,70 L50,50 L70,70" stroke="white" strokeWidth="3" fill="none" opacity="0.4" />
                </svg>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.12, scale: 1 }}
                transition={{ duration: 2, delay: 0.8 }}
                className="absolute top-1/4 left-1/5 w-32 h-32 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,10 L50,50 L30,70 L50,50 L70,70" stroke="white" strokeWidth="2.5" fill="none" opacity="0.35" />
                </svg>
            </motion.div>
            
            {/* Floating dots pattern - More visible */}
            <div className="absolute top-1/2 left-1/5 w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="absolute top-2/3 right-1/5 w-2.5 h-2.5 bg-white/60 rounded-full"></div>
            <div className="absolute bottom-1/4 left-2/3 w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="absolute top-1/6 left-1/2 w-1.5 h-1.5 bg-white/50 rounded-full"></div>
            <div className="absolute bottom-1/6 right-1/2 w-1.5 h-1.5 bg-white/50 rounded-full"></div>
            <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-white/50 rounded-full"></div>
            
            {/* Additional hexagon grid pattern */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                    <defs>
                        <pattern id="hero-hexagons" width="50" height="50" patternUnits="userSpaceOnUse">
                            <polygon points="25,5 45,15 45,35 25,45 5,35 5,15" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hero-hexagons)" />
                </svg>
            </div>
            
            {/* Geometric circles */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ duration: 3 }}
                className="absolute top-1/4 right-1/6 w-20 h-20 border-2 border-white/40 rounded-full pointer-events-none"
            ></motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.12, scale: 1 }}
                transition={{ duration: 3, delay: 0.5 }}
                className="absolute bottom-1/4 left-1/6 w-16 h-16 border-2 border-white/40 rounded-full pointer-events-none"
            ></motion.div>

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col min-h-[80vh] text-white">
                {/* Top Bar */}
                <div className="flex flex-wrap justify-end items-center gap-3 mb-10">
                    <LocaleSwitcher />

                    <button
                        onClick={handleLogin}
                        className="flex items-center gap-2 border border-white/50 text-white px-4 py-2 rounded-md hover:bg-white/10 transition text-sm sm:text-base backdrop-blur-sm"
                    >
                        <LogIn className="w-5 h-5" />
                        {t('login')}
                    </button>

                    <button
                        onClick={handleSignup}
                        className="flex items-center gap-2 bg-white px-5 py-2 rounded-md hover:bg-gray-100 transition shadow text-sm sm:text-base"
                        style={{ color: 'var(--brand-blue)' }}
                    >
                        <UserPlus className="w-5 h-5" />
                        {t('signup')}
                    </button>
                </div>

                {/* Hero Content */}
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 flex-1">
                    {/* Text Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="flex-1 text-center md:text-left"
                    >
                        <div className="flex flex-col items-center md:items-start mb-6">
                            <Image
                                src="/favi.png"
                                alt={t('logoAlt')}
                                width={100}
                                height={50}
                                className="object-contain mb-3 drop-shadow-lg"
                            />
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md">
                                {t('title')}
                            </h1>
                        </div>

                        <p className="text-base sm:text-lg text-white/90 mb-8 max-w-xl mx-auto md:mx-0">
                            {t('subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <button
                                onClick={handleGetStarted}
                                className="bg-white px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium shadow-lg"
                                style={{ color: 'var(--brand-blue)' }}
                            >
                                {t('cta.getStarted')}
                            </button>
                            <button
                                onClick={handleLearnMore}
                                className="border border-white/70 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition font-medium"
                            >
                                {t('cta.learnMore')}
                            </button>
                        </div>
                    </motion.div>

                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7 }}
                        className="flex-1 w-full max-w-2xl mx-auto order-first md:order-none"
                    >
                        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:h-[450px] lg:h-[500px] md:aspect-auto">
                            <Image
                                src="/uihome.png"
                                alt={t('dashboardAlt')}
                                fill
                                className="object-contain rounded-xl shadow-2xl"
                            />
                            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 flex gap-2 sm:gap-4 text-lg sm:text-2xl text-white/90">
                                <FaInstagram className="hover:scale-110 transition-transform cursor-pointer" />
                                <FaWhatsapp className="hover:scale-110 transition-transform cursor-pointer" />
                                <FaChartLine className="hover:scale-110 transition-transform cursor-pointer" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
