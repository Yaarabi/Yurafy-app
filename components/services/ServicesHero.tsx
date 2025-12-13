"use client";

import { motion } from "framer-motion";
import { Globe2, ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/home/LocaleSwitcher";

interface ServicesHeroProps {
    locale: string;
    requestQuote?: () => void;
}

export default function ServicesHero({ locale, requestQuote }: ServicesHeroProps) {
    const t = useTranslations("services");

    return (
        <section
            className="relative overflow-hidden min-h-[90vh] flex items-center px-6 sm:px-10 lg:px-16"
            style={{ backgroundColor: "var(--brand-blue)" }}
        >
            {/* Radial light overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.18),_transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.08),_transparent_55%)]" />

            {/* Floating hexagons */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-24 right-12 w-40 h-40 opacity-20 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon
                        points="50,5 95,25 95,75 50,95 5,75 5,25"
                        fill="white"
                        opacity="0.3"
                    />
                </svg>
            </motion.div>

            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-20 left-12 w-32 h-32 opacity-25 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon
                        points="50,5 95,25 95,75 50,95 5,75 5,25"
                        fill="white"
                        opacity="0.35"
                    />
                </svg>
            </motion.div>

            {/* Dots + connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
                <line x1="20%" y1="30%" x2="35%" y2="45%" stroke="white" strokeWidth="1.2" />
                <line x1="65%" y1="40%" x2="80%" y2="30%" stroke="white" strokeWidth="1.2" />
                <line x1="70%" y1="70%" x2="55%" y2="55%" stroke="white" strokeWidth="1.2" />
            </svg>

            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/60 rounded-full" />
            <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-white/60 rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-white/60 rounded-full" />

            <div className="relative z-10 max-w-7xl mx-auto w-full text-white">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-14">
                    <Link href={`/${locale}`} className="flex items-center gap-4">
                        <Image
                            src="/favi.png"
                            alt="Yurafy logo"
                            width={56}
                            height={56}
                            className="object-contain drop-shadow-lg"
                            priority
                        />
                        <div>
                            <h2 className="text-2xl font-bold">Yurafy</h2>
                            <p className="text-sm text-white/80">
                                Professional Services
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Globe2 className="w-5 h-5 text-white/80" />
                        <LocaleSwitcher />
                    </div>
                </div>

                {/* Hero Content */}
                <div className="text-center max-w-5xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8"
                    >
                        {t("hero.title")}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12 leading-relaxed"
                    >
                        {t("hero.subtitle")}
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center"
                    >
                        <button
                            onClick={requestQuote}
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white rounded-2xl font-semibold shadow-xl hover:scale-105 transition"
                            style={{ color: "var(--brand-blue)" }}
                        >
                            {t("hero.ctaPrimary")}
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <a
                            href="https://wa.me/+212716413605"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 border border-white/60 rounded-2xl font-semibold hover:bg-white/10 transition"
                        >
                            <MessageCircle className="w-5 h-5" />
                            {t("hero.ctaSecondary")}
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
