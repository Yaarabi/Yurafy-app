
'use client'
import SettingsForm from '@/components/dashboard/settingForm';
import {useTranslations} from 'next-intl';

export default function SettingsPage() {
    const t = useTranslations('settings');
    return (
        <div className="grid gap-4">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <SettingsForm />
        </div>
    );
}
