'use client';

import EditableField from '@/components/dashboard/setting/SettingsField';
import LogoUploader from '@/components/dashboard/setting/LogoPreview';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StoreSettingsProps {
    store: any;
    onUpdate: (field: string, value: any) => Promise<void> | void;
    onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
    locale: string | string[] | undefined;
}

export default function StoreSettings({ store, onUpdate, onUploadLogo, locale }: StoreSettingsProps) {
    const router = useRouter();
    const t = useTranslations('settings');
    const localeSlug = Array.isArray(locale) ? locale[0] : (locale || 'en');

    const openEditThemePage = () => {
        router.push(`/${localeSlug}/edit-theme/${store._id}`);
    };

    return (
        <div className="space-y-3 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-white dark:from-indigo-950/30 dark:via-blue-950/30 dark:to-gray-800 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
                <div>
                    <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">{t('theme.title')}</p>
                    <p className="text-xs text-indigo-700/80 dark:text-indigo-400/70">{t('theme.description')}</p>
                </div>
                <button
                    type="button"
                    onClick={openEditThemePage}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 dark:hover:from-indigo-700 dark:hover:to-indigo-800 active:scale-95 transition-all duration-150 whitespace-nowrap"
                >
                    <Sparkles className="w-4 h-4" />
                    {t('theme.button')}
                </button>
            </div>
            <LogoUploader logoUrl={store.logoUrl || ''} onUpload={onUploadLogo} />
            <EditableField label="Brand Name" value={store.brandName || ''} onSave={(val) => onUpdate('brandName', val)} />
            <EditableField label="Domain" value={store.domain || ''} onSave={(val) => onUpdate('domain', val)} />
            <EditableField label="Description" value={store.description || ''} onSave={(val) => onUpdate('description', val)} textarea />
            <EditableField label="Hero Title" value={store.hero?.title || ''} onSave={(val) => onUpdate('hero', { ...store.hero, title: val })} />
            <EditableField label="Hero Subtitle" value={store.hero?.subtitle || ''} onSave={(val) => onUpdate('hero', { ...store.hero, subtitle: val })} textarea />
            <EditableField label="Hero Image URL" value={store.hero?.imageUrl || ''} onSave={(val) => onUpdate('hero', { ...store.hero, imageUrl: val })} />
            <EditableField label="About Title" value={store.about?.title || ''} onSave={(val) => onUpdate('about', { ...store.about, title: val })} />
            <EditableField label="About Description" value={store.about?.description || ''} onSave={(val) => onUpdate('about', { ...store.about, description: val})} textarea />
            <EditableField label="Footer Text" value={store.footer?.text || ''} onSave={(val) => onUpdate('footer', { ...store.footer, text: val })} />
            <EditableField label="Facebook" value={store.socialLinks?.facebook || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, facebook: val })} />
            <EditableField label="Instagram" value={store.socialLinks?.instagram || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, instagram: val })} />
            <EditableField label="TikTok" value={store.socialLinks?.tiktok || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, tiktok: val })} />
        </div>
    );
}


