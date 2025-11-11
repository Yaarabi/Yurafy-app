import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';

const About: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#6366f1';
    
    const aboutData = about || {
        title: whoWeAre?.description ? undefined : `About ${brandName}`,
        description: whoWeAre?.description ||  '',
    };

    if (!aboutData.description && !aboutData.title) return null;

    return (
        <motion.section
            id="about"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden bg-slate-900 py-20 sm:py-24"
        >
            <GeometricDecorations type="professional" color={primaryColor} className="opacity-10" />
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `linear-gradient(120deg, ${primaryColor}15 0%, transparent 65%), radial-gradient(circle at 20% 20%, ${primaryColor}18, transparent 55%)`,
                }}
            />

            <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-center">
                <div className="relative flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-10">
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-semibold text-white sm:text-4xl"
                    >
                        {aboutData.title || `About ${brandName}`}
                    </motion.h3>

                    <div className="mt-6 flex items-center gap-3">
                        <span className="h-px flex-1 bg-white/25" />
                        <span
                            className="h-8 w-8 rotate-45 rounded-lg border border-white/30"
                            style={{ borderColor: primaryColor }}
                        />
                        <span className="h-px flex-1 bg-white/25" />
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 text-base leading-relaxed text-white/80 sm:text-lg"
                    >
                        {aboutData.description}
                    </motion.p>
                </div>

                <div className="relative hidden h-full min-h-[260px] flex-1 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 shadow-[0_35px_120px_-60px_rgba(15,23,42,1)] backdrop-blur-xl lg:block">
                    <div className="absolute inset-6 rounded-[32px] border border-white/15" />
                    <div className="absolute -right-12 top-16 h-32 w-32 rotate-45 rounded-xl border border-white/20" style={{ borderColor: primaryColor }} />
                    <div className="absolute -left-10 bottom-10 h-40 w-40 rotate-[30deg] rounded-3xl border border-white/10" style={{ borderColor: `${primaryColor}80` }} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_55%)]" />
                </div>
            </div>
        </motion.section>
    );
};

export default About;

