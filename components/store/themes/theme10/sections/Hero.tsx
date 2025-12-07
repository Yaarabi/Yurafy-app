import React, { CSSProperties } from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import { getStoreTranslation } from '../../../utils/translations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();
    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#c15a4a'; // flat background like your image
    const storeLanguage = selectedStore.language || 'en';

    const heroBackgroundStyle: CSSProperties = {
        backgroundColor: primaryColor,
    };

    return (
        <section className="relative overflow-hidden text-white" style={heroBackgroundStyle}>

            {/* === TEXT & CTA === */}
            <div className="relative mx-auto flex min-h-[75vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:py-24">
                <div className="max-w-2xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl"
                    >
                        {hero.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="mt-6 text-lg text-white/90 sm:text-xl max-w-xl"
                    >
                        {hero.subtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="mt-10"
                    >
                        <a
                            href="#products"
                            className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow hover:bg-white/90 transition"
                            style={{ color: primaryColor }}
                        >
                            {getStoreTranslation('shopNow', storeLanguage)}
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* === PRODUCT IMAGE (TEDDY STYLE) === */}
            {hero.imageUrl && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block"
                >
                    <img
                        src={hero.imageUrl}
                        alt="hero"
                        className="h-[420px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                    />
                </motion.div>
            )}

            {/* === BOTTOM CLOUD SHAPE (same as your example) === */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                <svg
                    viewBox="0 0 1440 120 1440 120 1440 120"
                    preserveAspectRatio="none"
                    className="block w-full h-[90px]"
                    style={{ fill: '#ffffff' }}
                >
                    <path d="M0,32 C120,80 240,80 360,50 C480,20 600,20 720,50 C840,80 960,80 1080,50 C1200,20 1320,20 1440,50 L1440,120 L0,120 Z" />
                </svg>
            </div>
        </section>
    );
};

export default Hero;
