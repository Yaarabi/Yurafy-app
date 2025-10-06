'use client';

import { useTranslations, useLocale } from 'next-intl';
import LocaleSwitcher from '../home/LocaleSwitcher';

export default function Header() {
    const t = useTranslations();
    const locale = useLocale();

    return (
        <header className="sticky top-0 z-20 h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900/90 backdrop-blur-sm shadow-md">
        <h1 className="text-lg font-semibold text-white">{t('common.appTitle')}</h1>
        <div className="flex items-center gap-2">
            <LocaleSwitcher />
        </div>
        </header>
    );
}
