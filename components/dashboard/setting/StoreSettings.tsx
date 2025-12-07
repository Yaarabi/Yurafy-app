'use client';

import EditableField from '@/components/dashboard/setting/SettingsField';
import LogoUploader from '@/components/dashboard/setting/LogoPreview';
import { useRouter } from 'next/navigation';
import { Palette, Sparkles } from 'lucide-react';

interface StoreSettingsProps {
    store: any;
    onUpdate: (field: string, value: any) => Promise<void> | void;
    onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
    locale: string | string[] | undefined;
}

export default function StoreSettings({ store, onUpdate, onUploadLogo, locale }: StoreSettingsProps) {
    const router = useRouter();
    const localeSlug = Array.isArray(locale) ? locale[0] : (locale || 'en');

    const openThemePage = () => {
        router.push(`/${localeSlug}/dashboard/settings/theme`);
    };

    return (
        <div className="space-y-3 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-white border border-indigo-100 rounded-xl">
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Theme & Colors</p>
                    <p className="text-xs text-indigo-700/80">Preview your live store and adjust theme colors with real data.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={openThemePage}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 active:scale-95 transition-transform duration-150"
                    >
                        <Palette className="w-4 h-4" />
                        Preview theme
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push(`/${localeSlug}/dashboard/settings/theme-select`)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 active:scale-95 transition-transform duration-150"
                    >
                        <Sparkles className="w-4 h-4" />
                        Change theme
                    </button>
                </div>
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


