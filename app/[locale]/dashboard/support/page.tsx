'use client';

import SupportChat from '@/components/dashboard/SupportChat';
import { useTranslations } from 'next-intl';

export default function SupportPage() {
    const t = useTranslations('support');

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white mb-6">
                {t('title')}
            </h2>
            <div className="w-full max-w-5xl">
                <SupportChat />
            </div>
        </div>
    );
}
