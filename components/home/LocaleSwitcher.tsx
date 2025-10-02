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
        const segments = pathname.split('/');
        segments[1] = newLocale; // replace first segment with new locale
        const newPathname = segments.join('/');
        router.replace(newPathname);
        router.refresh();
        }
    };

    return (
        <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        className="border border-gray-300 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition cursor-pointer"
        >
        {locales.map((loc) => (
            <option key={loc.code} value={loc.code}>
            {loc.label}
            </option>
        ))}
        </select>
    );
}
