
'use client'
import SupportBot from '@/components/dashboard/supportBot';
import {useTranslations} from 'next-intl';

export default function SupportPage() {
    const t = useTranslations('support');
    return (
        <div className="grid gap-4">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <SupportBot />
        </div>
    );
}
