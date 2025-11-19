"use client";

import { motion } from 'framer-motion';
import { Globe2, ArrowRight, ShoppingCart, MessageCircle, Truck, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/home/LocaleSwitcher';
import FeatureCard from './FeatureCard';

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

                {/* Large floating hexagons */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.25, scale: 1, rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-20 right-10 w-40 h-40"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" opacity="0.3" />
                    </svg>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.3, scale: 1, rotate: [360, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-20 left-10 w-36 h-36"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" opacity="0.3" />
                    </svg>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.2, scale: 1, rotate: [0, -360] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/4 w-28 h-28"
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
                    className="absolute top-1/3 right-1/3 w-24 h-24"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" opacity="0.3" />
                    </svg>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.18, scale: 1, rotate: [0, 360] }}
                    transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/3 left-1/3 w-20 h-20"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="white" opacity="0.3" />
                    </svg>
                </motion.div>
                
                {/* Circuit pattern nodes */}
                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/60 rounded-full"></div>
                <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-white/60 rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-white/60 rounded-full"></div>
                <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-white/60 rounded-full"></div>
                <div className="absolute top-1/5 right-1/5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                <div className="absolute bottom-1/5 left-1/5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-white/50 rounded-full"></div>
                <div className="absolute top-1/2 right-1/6 w-2 h-2 bg-white/50 rounded-full"></div>
                
                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full opacity-30">
                    <line x1="25%" y1="25%" x2="33%" y2="33%" stroke="white" strokeWidth="1.5" />
                    <line x1="67%" y1="33%" x2="75%" y2="25%" stroke="white" strokeWidth="1.5" />
                    <line x1="75%" y1="75%" x2="67%" y2="67%" stroke="white" strokeWidth="1.5" />
                    <line x1="33%" y1="67%" x2="25%" y2="75%" stroke="white" strokeWidth="1.5" />
                    <line x1="16%" y1="50%" x2="25%" y2="50%" stroke="white" strokeWidth="1" />
                    <line x1="75%" y1="50%" x2="84%" y2="50%" stroke="white" strokeWidth="1" />
                </svg>

                {/* Floating rectangles */}
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
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight px-4" style={{ fontFamily: 'Inter, Geist, system-ui, sans-serif' }}>
                            {t('hero.title')}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed font-semibold px-4" style={{ fontFamily: 'Inter, Geist, system-ui, sans-serif' }}>
                            {t('hero.subtitle')}
                        </p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.5 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 px-4"
                        >
                            <a
                                href="#video"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[var(--brand-blue)] rounded-xl font-bold text-base sm:text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105 group"
                            >
                                Learn More
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href="https://wa.me/+212716413605"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-base sm:text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30 hover:border-white/50 hover:scale-105 group"
                            >
                                <MessageCircle className="w-5 h-5" />
                                {t('hero.ctaSecondary')}
                            </a>
                        </motion.div>

                        {/* Feature Highlights - 4 Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4">
                            <FeatureCard
                                icon={ShoppingCart}
                                title={t('hero.features.codCheckout.title')}
                                description={t('hero.features.codCheckout.description')}
                                index={0}
                            />
                            <FeatureCard
                                icon={MessageCircle}
                                title={t('hero.features.whatsappAuto.title')}
                                description={t('hero.features.whatsappAuto.description')}
                                index={1}
                            />
                            <FeatureCard
                                icon={Truck}
                                title={t('hero.features.deliveryApi.title')}
                                description={t('hero.features.deliveryApi.description')}
                                index={2}
                            />
                            <FeatureCard
                                icon={Users}
                                title={t('hero.features.teamDashboard.title')}
                                description={t('hero.features.teamDashboard.description')}
                                index={3}
                            />
                        </div>
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
