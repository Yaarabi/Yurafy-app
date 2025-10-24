
'use client'
import SupportBot from '@/components/dashboard/supportBot';
import {useTranslations} from 'next-intl';

export default function SupportPage() {
    const t = useTranslations('support');
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('title')}</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <SupportBot />
        </div>
        </div>
    );
}
