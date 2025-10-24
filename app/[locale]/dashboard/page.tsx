"use client"
import {useTranslations} from 'next-intl';

export default function DashboardPage() {
    const t = useTranslations('dashboard');
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-6 rounded-lg">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
        </div>
        </div>
    );
}
