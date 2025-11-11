import React, { type CSSProperties } from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';
import { DollarSign, Truck, CheckCircle } from 'lucide-react';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';
import { useParams } from 'next/navigation';

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

const createLightGradient = (base: string, accent: string) => {
    return `linear-gradient(145deg, ${toRgba(base, 0.18)} 0%, ${toRgba(accent, 0.12)} 60%, rgba(255,255,255,0.97) 100%)`;
};

const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    const params = useParams();
    
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#6366f1';
    const secondaryColor = selectedStore.theme?.secondaryColor || primaryColor;
    const surfaceColor = selectedStore.theme?.surfaceColor || primaryColor;
    const headingColor = '#0f172a';
    const copyColor = 'rgba(15, 23, 42, 0.72)';
    const rawLocale = params?.locale;
    const localeFromRoute = Array.isArray(rawLocale) ? rawLocale[0] : rawLocale;
    const languageSource = localeFromRoute && typeof localeFromRoute === 'string' && localeFromRoute.length > 0
        ? localeFromRoute
        : selectedStore.language || 'en';
    const storeLanguage = languageSource.split('-')[0]?.toLowerCase() || 'en';

    const features = [
        {
            Icon: DollarSign,
            title: getStoreTranslation("cashOnDelivery", storeLanguage),
            description: getStoreTranslation("cashOnDeliveryDesc", storeLanguage),
        },
        {
            Icon: Truck,
            title: getStoreTranslation("fastShipping", storeLanguage),
            description: getStoreTranslation("fastShippingDesc", storeLanguage),
        },
        {
            Icon: CheckCircle,
            title: getStoreTranslation("highQuality", storeLanguage),
            description: getStoreTranslation("highQualityDesc", storeLanguage),
        },
    ];

    const trustBackgroundStyle: CSSProperties = {
        background: createLightGradient(surfaceColor, secondaryColor),
        borderColor: toRgba(surfaceColor, 0.2),
    };

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.2 },
                },
            }}
            className="relative overflow-hidden border-y py-20 text-slate-900 sm:py-24"
            style={trustBackgroundStyle}
        >
            <GeometricDecorations type="professional" color={primaryColor} className="opacity-20" />

            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `linear-gradient(160deg, transparent 0%, ${toRgba(surfaceColor, 0.18)} 35%, transparent 70%), radial-gradient(circle at 15% 15%, ${toRgba(primaryColor, 0.14)}, transparent 55%)`,
                }}
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-3 rounded-full border px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
                        style={{ borderColor: toRgba(primaryColor, 0.25), color: primaryColor, backgroundColor: toRgba(primaryColor, 0.08) }}
                    >
                        {getStoreTranslation('whyChooseUs', storeLanguage)}
                    </motion.div>
                    <h3 className="mt-6 text-3xl font-semibold sm:text-4xl" style={{ color: headingColor }}>
                        {getStoreTranslation('whyChooseUs', storeLanguage)}
                    </h3>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <span className="h-px w-16" style={{ backgroundColor: toRgba(surfaceColor, 0.24) }} />
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="h-px w-24" style={{ backgroundColor: toRgba(primaryColor, 0.2) }} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="relative overflow-hidden rounded-3xl border bg-white p-8 text-center text-slate-900 shadow-[0_35px_100px_-60px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1.5"
                            style={{ borderColor: toRgba(surfaceColor, 0.2), boxShadow: `0 35px 90px -55px ${toRgba(primaryColor, 0.4)}` }}
                        >
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(15,23,42,0.08),transparent_55%)]" />
                            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rotate-45" style={{ border: `1px solid ${toRgba(primaryColor, 0.16)}`, backgroundColor: toRgba(primaryColor, 0.06) }} />
                            <div className="pointer-events-none absolute -left-12 bottom-10 h-32 w-32 rotate-[30deg]" style={{ border: `1px solid ${toRgba(primaryColor, 0.14)}` }} />

                            <div
                                className="relative mx-auto mb-6 grid h-16 w-16 place-content-center rounded-2xl border"
                                style={{ borderColor: toRgba(primaryColor, 0.3), color: primaryColor, backgroundColor: toRgba(primaryColor, 0.1) }}
                            >
                                <feature.Icon className="h-8 w-8" />
                            </div>
                            <h4 className="relative text-lg font-semibold" style={{ color: headingColor }}>
                                {feature.title}
                            </h4>
                            <p className="relative mt-4 text-sm leading-relaxed" style={{ color: copyColor }}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default Trust;

