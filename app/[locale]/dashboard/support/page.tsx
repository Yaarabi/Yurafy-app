'use client';

import SupportBot from '@/components/dashboard/supportBot';
import { useTranslations } from 'next-intl';

export default function SupportPage() {
    const t = useTranslations('support');

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white mb-6">
            {t('title')}
        </h2>

        {/* <div className="w-full max-w-3xl flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 sm:p-4 md:p-6"> */}
            <SupportBot />
        {/* </div> */}
        </div>
    );
}
