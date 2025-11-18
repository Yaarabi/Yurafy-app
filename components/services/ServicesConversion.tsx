"use client";

import { FaWhatsapp } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface ServicesConversionProps {
    onRequest: () => void;
}

export default function ServicesConversion({ onRequest }: ServicesConversionProps) {
    const t = useTranslations('services.conversion');
    const locale = useLocale();
    const isArabic = locale === 'ar';

    const whatsappHref = `https://wa.me/+212716413605?text=${encodeURIComponent(t('heading'))}`;

    return (
        <section
        className="max-w-5xl mx-auto px-4 mt-4 mb-16"
        dir={isArabic ? 'rtl' : 'ltr'}
        >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 dark:text-white">
            {t('heading')}
            </h2>
            <p className="mt-3 text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            {t('subtext')}
            </p>

            <div className={`mt-8 flex flex-col sm:flex-row gap-4 ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
            <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('chatAria')}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-semibold px-6 py-4 text-white shadow hover:shadow-lg transition-all text-sm sm:text-base"
                style={{ background: 'linear-gradient(90deg,#25D366,#128C7E)' }}
            >
                <FaWhatsapp className="w-5 h-5" />
                {t('chatLabel')}
            </a>
            <button
                onClick={onRequest}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-semibold px-6 py-4 text-white shadow hover:shadow-lg transition-all text-sm sm:text-base"
                style={{ background: 'linear-gradient(to right, var(--brand-blue), #1e40af)' }}
            >
                {t('requestLabel')}
            </button>
            </div>
            <p className="mt-2 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t('requestNote')}
            </p>
            <p className="mt-6 text-center text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            {t('addon')}
            </p>
        </div>
        </section>
    );
}
