'use client';
import { useTranslations } from 'next-intl';

export default function BrandHeader() {
    const t = useTranslations('HeroSection');

    return (
        <div className="flex items-center justify-center mb-12 space-x-4">
        {/* Logo */}
        <img
            src="/logo.png"
            alt={t('logoAlt')}
            className="h-40 w-auto md:h-24"
        />

        </div>
    );
}
