'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

const locales = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'AR' },
];

export default function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();

    const switchLocale = (newLocale: string) => {
        if (newLocale === locale) return; // Already on this locale
        
        // Get current pathname (without locale prefix)
        const currentPath = pathname || '/';
        
        // Set locale cookie immediately
        if (newLocale !== 'en') {
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        } else {
            // Remove cookie for default locale
            document.cookie = 'NEXT_LOCALE=; path=/; max-age=0';
        }
        
        // Handle subdomain routes (e.g., /[locale]/[domain])
        if (params.domain) {
            // For store subdomain routes, navigate to new locale with same domain
            const newPath = `/${newLocale}/${params.domain}${currentPath === '/' ? '' : currentPath}`;
            window.location.href = newPath;
        } else {
            // For regular routes, construct the path with locale
            let newPath: string;
            if (newLocale === 'en') {
                // English: no prefix (as-needed locale prefix)
                newPath = currentPath === '/' ? '/' : currentPath;
            } else {
                // Other locales: add prefix
                newPath = currentPath === '/' ? `/${newLocale}` : `/${newLocale}${currentPath}`;
            }
            
            // Use window.location for full page reload to ensure locale cookie is set
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
