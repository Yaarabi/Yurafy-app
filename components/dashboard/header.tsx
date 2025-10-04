
'use client';
import {useTranslations, useLocale} from 'next-intl';
import LocaleSwitcher from '../home/LocaleSwitcher';

export default function Header() {
    const t = useTranslations();
    const locale = useLocale();

    return (
        <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900/60">
        <h1 className="text-lg font-semibold">{t('common.appTitle')}</h1>
        <div className="flex items-center gap-2">
            {/* <LangSwitcher locale={locale} /> */}
            <LocaleSwitcher/>
        </div>
        </header>
    );
}


