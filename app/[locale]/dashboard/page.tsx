"use client"
import {useTranslations} from 'next-intl';

export default function DashboardPage() {
    const t = useTranslations('dashboard');
    return (
        <div className="grid gap-6">
        <h2 className="text-2xl font-semibold text-white">{t('title')}</h2>
        <p className="text-gray-300">{t('subtitle')}</p>
        </div>
    );
}
