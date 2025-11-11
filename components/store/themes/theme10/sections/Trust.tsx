import React from 'react';
import { useStore } from '../../../hooks/useStore';
import { motion, Variants } from 'framer-motion';
import { DollarSign, Truck, CheckCircle } from 'lucide-react';
import GeometricDecorations from '../../shared/GeometricDecorations';
import { getStoreTranslation } from '../../../utils/translations';

const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const Trust: React.FC = () => {
    const { selectedStore } = useStore();
    
    if (!selectedStore) return null;
    
    const primaryColor = selectedStore.theme?.primaryColor || '#6366f1';
    const storeLanguage = selectedStore.language || 'en';

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
            className="relative overflow-hidden border-y border-white/10 bg-slate-950 py-20 sm:py-24"
        >
            <GeometricDecorations type="professional" color={primaryColor} className="opacity-10" />

            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `linear-gradient(160deg, transparent 0%, ${primaryColor}12 35%, transparent 70%), radial-gradient(circle at 15% 15%, ${primaryColor}20, transparent 55%)`,
                }}
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70"
                        style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
                    >
                        {getStoreTranslation('whyChooseUs', storeLanguage)}
                    </motion.div>
                    <h3 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
                        {getStoreTranslation('whyChooseUs', storeLanguage)}
                    </h3>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <span className="h-px w-16 bg-white/20" />
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="h-px w-24 bg-white/20" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-8 text-center text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,1)] transition-all duration-300 hover:border-white/25 hover:bg-white/[0.12]"
                        >
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(255,255,255,0.3),transparent_55%)]" />
                            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rotate-45 border border-white/10" />
                            <div className="pointer-events-none absolute -left-12 bottom-10 h-32 w-32 rotate-[30deg] border border-white/10" />

                            <div
                                className="relative mx-auto mb-6 grid h-16 w-16 place-content-center rounded-2xl border border-white/20 bg-white/10"
                                style={{ borderColor: `${primaryColor}55`, color: primaryColor }}
                            >
                                <feature.Icon className="h-8 w-8" />
                            </div>
                            <h4 className="relative text-lg font-semibold text-white">
                                {feature.title}
                            </h4>
                            <p className="relative mt-4 text-sm leading-relaxed text-white/70">
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

