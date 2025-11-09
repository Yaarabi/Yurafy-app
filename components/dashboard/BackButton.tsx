"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function BackButton() {
    const router = useRouter();
    const t = useTranslations();

    return (
        <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--brand-blue)] dark:hover:text-[var(--brand-blue)] transition-colors mb-4"
        >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.buttons.back')}</span>
        </button>
    );
}

