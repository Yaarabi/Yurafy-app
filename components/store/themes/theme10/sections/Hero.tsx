import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';

const Hero: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { hero } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#6366f1';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const storeLanguage = selectedStore.language || 'en';

    return (
        <section className="relative overflow-hidden bg-slate-950 text-white">
            <GeometricDecorations type="professional" color={primaryColor} className="opacity-10" />

            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `radial-gradient(circle at 20% 20%, ${primaryColor}33, transparent 55%), radial-gradient(circle at 80% 15%, ${secondaryColor}40, transparent 60%), linear-gradient(140deg, ${primaryColor}26, transparent 55%)`,
                }}
            />

            {hero.imageUrl && (
                <div className="pointer-events-none absolute -right-32 top-1/2 hidden h-[520px] w-[520px] -translate-y-1/2 rounded-[18rem] border border-white/10 bg-white/5 shadow-[0_0_120px_-20px_rgba(255,255,255,0.4)] lg:block">
                    <div
                        className="absolute inset-6 rounded-[16rem] bg-cover bg-center"
                        style={{ backgroundImage: `url(${hero.imageUrl})` }}
                    />
                    <div className="absolute inset-0 -z-10 rotate-12 rounded-[18rem] border border-white/10" />
                </div>
            )}

            <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 md:py-24 lg:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8 md:p-12"
                >
                    <motion.h2
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                        className="text-3xl font-bold leading-tight sm:text-5xl md:text-6xl"
                    >
                        {hero.title}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
                        className="mt-6 text-base text-white/80 sm:text-lg md:text-xl"
                    >
                        {hero.subtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
                        className="mt-10"
                    >
                        <a
                            href="#products"
                            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/30 bg-white/90 px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 transition-all duration-300 hover:border-white/60 hover:bg-white"
                            style={{ color: primaryColor }}
                        >
                            <span className="absolute inset-0 translate-x-full bg-white/40 transition-transform duration-500 group-hover:translate-x-0" />
                            <span className="relative z-10 text-slate-900" style={{ color: primaryColor }}>
                                {getStoreTranslation('shopNow', storeLanguage)}
                            </span>
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;

