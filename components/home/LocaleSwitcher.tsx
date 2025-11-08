'use client';

import { usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

const locales = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'AR' },
];

export default function LocaleSwitcher() {

    const pathname = usePathname();
    const params = useParams();
    const locale = params.locale || 'en';

    const switchLocale = (newLocale: string) => {
        if (newLocale === locale) return;

        const currentPath = pathname || '/';

        // Set locale cookie
        if (newLocale !== 'en') {
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        } else {
        document.cookie = 'NEXT_LOCALE=; path=/; max-age=0';
        }

        // Handle domain-prefixed routes
        if (params.domain) {
        const newPath = `/${newLocale}/${params.domain}${currentPath === '/' ? '' : currentPath}`;
        window.location.href = newPath;
        } else {
        let newPath: string;
        if (newLocale === 'en') {
            newPath = currentPath === '/' ? '/' : currentPath;
        } else {
            newPath = currentPath === '/' ? `/${newLocale}` : `/${newLocale}${currentPath}`;
        }
        window.location.href = newPath;
        }
    };

    return (
        <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        className="border bg-gray-200 border-gray-300 px-2 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition cursor-pointer"
        >
        {locales.map((loc) => (
            <option key={loc.code} value={loc.code}>
            {loc.label}
            </option>
        ))}
        </select>
    );
}
