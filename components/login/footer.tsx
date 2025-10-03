
"use client"
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('FooterLogin');

    return (
        <footer className="mt-8 text-gray-400 text-sm text-center">
        {t('companyDescription')}<br />
        {t('copyright')}
        </footer>
    );
}
