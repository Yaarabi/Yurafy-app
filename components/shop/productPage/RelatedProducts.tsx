'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function RelatedProducts() {
  const t = useTranslations('product'); // using 'relatedProducts' key

    return (
        <motion.section
        className="max-w-7xl mx-auto mt-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('relatedProducts')}
        </h2>
        </motion.section>
    );
}
