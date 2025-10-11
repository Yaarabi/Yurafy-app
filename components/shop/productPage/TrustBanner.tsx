'use client';

import { motion } from 'framer-motion';
import { FaTruck, FaMoneyBillWave, FaHeadset } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export default function TrustBanner() {
    const t = useTranslations('trustBanner');

    const items = [
        { icon: FaMoneyBillWave, text: t('cod'), delay: 0 },
        { icon: FaTruck, text: t('fastDelivery'), delay: 0.1 },
        { icon: FaHeadset, text: t('support'), delay: 0.2 },
    ];

    return (
        <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="
            mt-14 sm:mt-20 
            grid grid-cols-1 sm:grid-cols-3 gap-6 
            px-6 py-10 sm:px-10 sm:py-12 
            max-w-6xl mx-auto
        "
        >
        {items.map(({ icon: Icon, text, delay }, i) => (
            <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="
                flex flex-col items-center justify-center
                text-center p-4 sm:p-6
                bg-gradient-to-b from-white/90 to-white/60
                rounded-xl shadow-sm hover:shadow-md
                transition-all duration-300
            "
            >
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
                <Icon className="text-3xl sm:text-4xl" />
            </div>
            <p className="font-semibold text-gray-800 text-base sm:text-lg">
                {text}
            </p>
            </motion.div>
        ))}
        </motion.section>
    );
}
