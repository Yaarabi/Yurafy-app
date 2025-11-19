"use client";

import { motion } from 'framer-motion';
import { Sparkles, Globe2, ArrowRight, CheckCircle2 } from 'lucide-react';
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
        <section className="relative overflow-hidden py-24 px-4 min-h-[80vh] flex items-center" style={{ background: 'linear-gradient(135deg, var(--brand-blue) 0%, #1e40af 50%, #1e3a8a 100%)' }}>
            {/* Modern Geometric Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Animated gradient orbs */}
                <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                {/* Modern grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="modern-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                            <circle cx="25" cy="25" r="1" fill="white" opacity="0.5"/>
                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#modern-grid)" />
                </svg>

                {/* Floating elements */}
                <motion.div
                    animate={{ 
                        y: [0, -20, 0],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-32 right-20 w-24 h-24 border-2 border-white/20 rounded-2xl backdrop-blur-sm"
                />
                <motion.div
                    animate={{ 
                        y: [0, 20, 0],
                        rotate: [0, -5, 0]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-32 left-20 w-32 h-32 border-2 border-white/20 rounded-full backdrop-blur-sm"
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
                            <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-3 group-hover:scale-110 transition-transform duration-300 border border-white/20">
                                <Image
                                    src="/favi.png"
                                    alt="Yurafy logo"
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-contain"
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
                <div className="text-center max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                    

                        {/* Main Title */}
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                            {t('hero.title')}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                            {t('hero.subtitle')}
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                            >
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-white/90">Professional Quality</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                            >
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-white/90">Fast Delivery</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                            >
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-white/90">24/7 Support</span>
                            </motion.div>
                        </div>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.8 }}
                        >
                            <a
                                href="#services"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[var(--brand-blue)] rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105 group"
                            >
                                Explore Services
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Stats Bar */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 1 }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
                >
                    {[
                        { value: '60+', label: 'Projects' },
                        { value: '98%', label: 'Satisfaction' },
                        { value: '24/7', label: 'Support' },
                        { value: '50+', label: 'Clients' },
                    ].map((stat, index) => (
                        <div key={index} className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-blue-100/80">{stat.label}</div>
                        </div>
                    ))}
                </motion.div> */}
            </div>
        </section>
    );
}
