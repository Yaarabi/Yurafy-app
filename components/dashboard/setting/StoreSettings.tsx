'use client';

import EditableField from '@/components/dashboard/setting/SettingsField';
import LogoUploader from '@/components/dashboard/setting/LogoPreview';

interface StoreSettingsProps {
    store: any;
    onUpdate: (field: string, value: any) => Promise<void> | void;
    onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
    locale: string | string[] | undefined;
}

export default function StoreSettings({ store, onUpdate, onUploadLogo, locale }: StoreSettingsProps) {
    return (
        <div className="space-y-3 sm:space-y-6">
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


