'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const locales = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'AR' },
];

export default function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: string) => {
        if (newLocale !== locale) {
            const segments = pathname.split('/').filter(Boolean); // Remove empty strings
            
            // Check if current path has a locale prefix (fr or ar)
            const hasLocalePrefix = segments.length > 0 && ['fr', 'ar'].includes(segments[0]);
            
            // If current path has locale prefix, remove it to get the base path
            const basePath = hasLocalePrefix ? segments.slice(1) : segments;
            
            let newPathname: string;
            
            if (newLocale === 'en') {
                // English is the default locale - no prefix needed
                newPathname = basePath.length > 0 ? `/${basePath.join('/')}` : '/';
            } else {
                // Other locales need a prefix
                newPathname = basePath.length > 0 ? `/${newLocale}/${basePath.join('/')}` : `/${newLocale}`;
            }
            
            router.replace(newPathname);
            router.refresh();
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
