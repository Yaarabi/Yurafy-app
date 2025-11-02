'use client';

import SettingsSection from '@/components/dashboard/setting/settingSection';
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
        <>
        <SettingsSection title="Store Information">
            <div className="space-y-6">
                <LogoUploader logoUrl={store.logoUrl || ''} onUpload={onUploadLogo} />
                <EditableField label="Brand Name" value={store.brandName || ''} onSave={(val) => onUpdate('brandName', val)} />
                <EditableField label="Domain" value={store.domain || ''} onSave={(val) => onUpdate('domain', val)} />
                <EditableField label="Description" value={store.description || ''} onSave={(val) => onUpdate('description', val)} />
            </div>
        </SettingsSection>

        <SettingsSection title="Hero Section">
            <EditableField label="Title" value={store.hero?.title || ''} onSave={(val) => onUpdate('hero', { ...store.hero, title: val })} />
            <EditableField label="Subtitle" value={store.hero?.subtitle || ''} onSave={(val) => onUpdate('hero', { ...store.hero, subtitle: val })} />
            <EditableField label="Image URL" value={store.hero?.imageUrl || ''} onSave={(val) => onUpdate('hero', { ...store.hero, imageUrl: val })} />
        </SettingsSection>

        <SettingsSection title="About Section">
            <EditableField label="Title" value={store.about?.title || ''} onSave={(val) => onUpdate('about', { ...store.about, title: val })} />
            <EditableField label="Description" value={store.about?.description || ''} onSave={(val) => onUpdate('about', { ...store.about, description: val })} />
        </SettingsSection>

        <SettingsSection title="Footer">
            <EditableField label="Footer Text" value={store.footer?.text || ''} onSave={(val) => onUpdate('footer', { ...store.footer, text: val })} />
        </SettingsSection>

        <SettingsSection title="Social Links">
            <EditableField label="Facebook" value={store.socialLinks?.facebook || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, facebook: val })} />
            <EditableField label="Instagram" value={store.socialLinks?.instagram || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, instagram: val })} />
            <EditableField label="Twitter" value={store.socialLinks?.twitter || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, twitter: val })} />
        </SettingsSection>
        </>
    );
}


