import React, { type CSSProperties } from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import GeometricDecorations from '../../shared/GeometricDecorations';

const toRgba = (hexColor: string, alpha = 1) => {
    const normalized = hexColor.replace('#', '');
    const expanded = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized.slice(0, 6);
    const bigint = Number.parseInt(expanded || '6366f1', 16);
    const value = Number.isNaN(bigint) ? 0x6366f1 : bigint;

    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const About: React.FC = () => {
    const { selectedStore } = useStore();

    if (!selectedStore) return null;

    const { about, brandName, whoWeAre } = selectedStore;
    const primaryColor = selectedStore.theme?.primaryColor || '#6366f1';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const surfaceColor = selectedStore.theme?.surfaceColor || primaryColor;
    const surfaceGradient = surfaceColor
    const headingColor = '#0f172a';
    const copyColor = 'rgba(15, 23, 42, 0.72)';
    
    const aboutData = about || {
        title: whoWeAre?.description ? undefined : `About ${brandName}`,
        description: whoWeAre?.description ||  '',
    };

    if (!aboutData.description && !aboutData.title) return null;

    const aboutBackgroundStyle: CSSProperties = {
        background: surfaceGradient,
    };

    const cardBackgroundStyle: CSSProperties = {
        background: `linear-gradient(150deg, rgba(255,255,255,0.92) 0%, ${toRgba(surfaceColor, 0.18)} 45%, rgba(255,255,255,0.88) 100%)`,
    };

    const cardGlowStyle: CSSProperties = {
        background: `radial-gradient(circle at 26% 18%, ${toRgba(primaryColor, 0.22)}, transparent 62%)`,
    };

    const cardBeamStyle: CSSProperties = {
        background: `linear-gradient(120deg, ${toRgba(primaryColor, 0.14)} 0%, transparent 65%)`,
    };

    return (
        <motion.section
            id="about"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden py-20 text-slate-900 sm:py-24"
            style={aboutBackgroundStyle}
        >
            <GeometricDecorations type="professional" color={primaryColor} className="opacity-20" />
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `linear-gradient(120deg, ${toRgba(surfaceColor, 0.16)} 0%, transparent 65%), radial-gradient(circle at 20% 20%, ${toRgba(primaryColor, 0.18)}, transparent 55%)`,
                }}
            />

            <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-center">
                <div
                    className="relative flex-1 overflow-hidden rounded-3xl border bg-white/90 p-6 shadow-[0_45px_110px_-60px_rgba(15,23,42,0.38)] backdrop-blur-2xl sm:p-10"
                    style={{
                        ...cardBackgroundStyle,
                        borderColor: toRgba(primaryColor, 0.24),
                        boxShadow: `0 45px 110px -60px ${toRgba(primaryColor, 0.45)}`,
                    }}
                >
                    <div className="pointer-events-none absolute inset-0 opacity-90" style={cardGlowStyle} />
                    <div className="pointer-events-none absolute inset-0" style={cardBeamStyle} />
                    <div
                        className="pointer-events-none absolute -top-32 right-8 h-56 w-56 rounded-full blur-3xl"
                        style={{ background: toRgba(secondaryColor, 0.22) }}
                    />
                    <div
                        className="pointer-events-none absolute -bottom-36 left-6 h-64 w-64 rounded-full blur-3xl"
                        style={{ background: toRgba(primaryColor, 0.2) }}
                    />
                    <div
                        className="pointer-events-none absolute inset-3 rounded-[30px] border"
                        style={{ borderColor: toRgba(surfaceColor, 0.18) }}
                    />

                    <div className="relative z-10">
                        <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em]"
                            style={{
                                borderColor: toRgba(primaryColor, 0.18),
                                color: toRgba(primaryColor, 0.75),
                                backgroundColor: toRgba(surfaceColor, 0.12),
                            }}
                        >
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: primaryColor, boxShadow: `0 0 0 4px ${toRgba(primaryColor, 0.12)}` }}
                            />
                            {brandName ? `${brandName} · Story` : 'Our Story'}
                        </motion.span>

                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-6 text-3xl font-semibold sm:text-4xl"
                            style={{ color: headingColor }}
                        >
                            {aboutData.title || `About ${brandName}`}
                        </motion.h3>


                        <motion.p
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 text-base leading-relaxed sm:text-lg"
                            style={{ color: copyColor }}
                        >
                            {aboutData.description}
                        </motion.p>

                        <div className="mt-10 h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(15,23,42,0.2)] to-transparent" />
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default About;

