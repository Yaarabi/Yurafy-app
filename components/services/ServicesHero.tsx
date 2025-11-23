"use client";

import { motion } from 'framer-motion';
import { Globe2, ArrowRight, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/home/LocaleSwitcher';

interface ServicesHeroProps {
    locale: string;
}

export default function ServicesHero({ locale }: ServicesHeroProps) {
    const t = useTranslations('services');

    return (
        <section className="relative overflow-hidden py-20 px-4 min-h-[90vh] flex items-center bg-gradient-to-br from-gray-900 via-blue-950 to-slate-900">
            {/* Background Image Slideshow */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        opacity: [1, 1, 0, 0, 0, 0, 1, 1]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Image
                        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80"
                        alt="Smart webstore workspace"
                        fill
                        className="object-cover opacity-50 dark:opacity-40 scale-105"
                        priority
                    />
                </motion.div>
                
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        opacity: [0, 0, 1, 1, 0, 0, 0, 0]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Image
                        src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=80"
                        alt="E-commerce dashboard"
                        fill
                        className="object-cover opacity-50 dark:opacity-40 scale-105"
                    />
                </motion.div>
                
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        opacity: [0, 0, 0, 0, 1, 1, 0, 0]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Image
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80"
                        alt="Digital commerce analytics"
                        fill
                        className="object-cover opacity-50 dark:opacity-40 scale-105"
                    />
                </motion.div>
                
                {/* Enhanced gradient overlay with brand colors */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-blue)]/40 via-blue-900/30 to-slate-900/50" />
                
                {/* Noise texture overlay for premium feel */}
                <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JhaW4iIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSByPSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFpbikiLz48L3N2Zz4=')]" />
            </div>

            {/* Enhanced Modern Geometric Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Animated brand color orbs */}
                <motion.div 
                    className="absolute top-20 -left-20 w-96 h-96 bg-[var(--brand-blue)]/20 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                    className="absolute bottom-20 -right-20 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.15, 0.25, 0.15]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
                
                {/* Premium grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="premium-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="30" cy="30" r="1.5" fill="white" opacity="0.8"/>
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" opacity="0.4"/>
                            <circle cx="0" cy="0" r="0.5" fill="white" opacity="0.6"/>
                            <circle cx="60" cy="60" r="0.5" fill="white" opacity="0.6"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#premium-grid)" />
                </svg>

                {/* Floating brand hexagons with glow */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                        opacity: [0.2, 0.4, 0.2], 
                        scale: [1, 1.1, 1], 
                        rotate: [0, 360] 
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-20 right-10 w-32 h-32"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                        <polygon 
                            points="50,5 95,25 95,75 50,95 5,75 5,25" 
                            fill="url(#hexGradient)" 
                            opacity="0.6" 
                        />
                        <defs>
                            <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--brand-blue)" />
                                <stop offset="100%" stopColor="#0ea5e9" />
                            </linearGradient>
                        </defs>
                    </svg>
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                        opacity: [0.15, 0.35, 0.15], 
                        scale: [1, 1.2, 1], 
                        rotate: [360, 0] 
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-20 left-10 w-28 h-28"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                        <polygon 
                            points="50,5 95,25 95,75 50,95 5,75 5,25" 
                            fill="url(#hexGradient2)" 
                            opacity="0.7" 
                        />
                        <defs>
                            <linearGradient id="hexGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0ea5e9" />
                                <stop offset="100%" stopColor="var(--brand-blue)" />
                            </linearGradient>
                        </defs>
                    </svg>
                </motion.div>

                {/* Premium floating elements */}
                <motion.div
                    animate={{ 
                        y: [0, -30, 0],
                        rotate: [0, 10, 0],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-32 right-20 w-20 h-20 border border-white/20 rounded-2xl backdrop-blur-sm bg-white/5 shadow-2xl"
                />
                <motion.div
                    animate={{ 
                        y: [0, 25, 0],
                        rotate: [0, -8, 0],
                        scale: [1, 1.08, 1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-32 left-20 w-24 h-24 border border-sky-400/30 rounded-full backdrop-blur-sm bg-sky-400/10 shadow-xl"
                />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 w-full">
                {/* Top Bar: Logo and Locale Switcher */}
                <div className="flex items-center justify-between mb-12">
                    <Link href={`/${locale}`} className="group flex items-center gap-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:bg-white/30 transition-all"></div>
                            <div className="relative group-hover:scale-110 transition-transform duration-300">
                                <Image
                                    src="/favi.png"
                                    alt="Yurafy logo"
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-contain"
                                    priority
                                />
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-blue-100 transition-colors">
                                Yurafy
                            </h2>
                            <p className="text-sm text-blue-100/80">Professional Services</p>
                        </motion.div>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center gap-3"
                    >
                        <Globe2 className="w-5 h-5 text-white/80" />
                        <LocaleSwitcher />
                    </motion.div>
                </div>

                {/* Hero Content */}
                <div className="text-center max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] px-4 tracking-tight" style={{ fontFamily: 'Inter, Geist, system-ui, sans-serif' }}>
                            <span className="bg-gradient-to-r from-white via-sky-100 to-sky-200 bg-clip-text text-transparent">
                                {t('hero.title')}
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl md:text-2xl text-blue-100/90 mb-12 max-w-4xl mx-auto leading-relaxed font-medium px-4" style={{ fontFamily: 'Inter, Geist, system-ui, sans-serif' }}>
                            {t('hero.subtitle')}
                        </p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.5 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 px-4"
                        >
                            <motion.a
                                href="#video"
                                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[var(--brand-blue)] rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-white/30 overflow-hidden"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-50 to-sky-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10">Learn More</span>
                                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.a>
                            
                            <motion.a
                                href="https://wa.me/+212716413605"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 border border-white/20 hover:border-white/40 overflow-hidden"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-blue)]/20 to-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <MessageCircle className="relative z-10 w-5 h-5" />
                                <span className="relative z-10">{t('hero.ctaSecondary')}</span>
                            </motion.a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
