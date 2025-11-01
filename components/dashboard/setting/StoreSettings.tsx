'use client';

import SettingsSection from '@/components/dashboard/setting/settingSection';
import EditableField from '@/components/dashboard/setting/SettingsField';
import LogoUploader from '@/components/dashboard/setting/LogoPreview';
import Link from 'next/link';

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
            <EditableField label="Brand Name" value={store.brandName || ''} onSave={(val) => onUpdate('brandName', val)} />
            <EditableField label="Domain" value={store.domain || ''} onSave={(val) => onUpdate('domain', val)} />
            <EditableField label="Description" value={store.description || ''} onSave={(val) => onUpdate('description', val)} />
            <EditableField label="Theme ID" value={String(store.themeId || 1)} onSave={(val) => onUpdate('themeId', parseInt(val || '1', 10))} />
        </SettingsSection>

        <SettingsSection title="Theme Colors">
            <EditableField label="Primary Color" value={store.theme?.primaryColor || ''} onSave={(val) => onUpdate('theme', { ...store.theme, primaryColor: val })} />
            <EditableField label="Secondary Color" value={store.theme?.secondaryColor || ''} onSave={(val) => onUpdate('theme', { ...store.theme, secondaryColor: val })} />
            <EditableField label="Text Color" value={store.theme?.textColor || ''} onSave={(val) => onUpdate('theme', { ...store.theme, textColor: val })} />
        </SettingsSection>

        <SettingsSection title="Theme Structure">
            <EditableField label="Show Header" value={String(store.themeStructure?.header ?? true)} onSave={(val) => onUpdate('themeStructure', { ...store.themeStructure, header: val === 'true' })} />
            <EditableField label="Show Hero" value={String(store.themeStructure?.hero ?? true)} onSave={(val) => onUpdate('themeStructure', { ...store.themeStructure, hero: val === 'true' })} />
            <EditableField label="Show About" value={String(store.themeStructure?.about ?? true)} onSave={(val) => onUpdate('themeStructure', { ...store.themeStructure, about: val === 'true' })} />
            <EditableField label="Show Trust" value={String(store.themeStructure?.trust ?? true)} onSave={(val) => onUpdate('themeStructure', { ...store.themeStructure, trust: val === 'true' })} />
            <EditableField label="Show Product Grid" value={String(store.themeStructure?.productGrid ?? true)} onSave={(val) => onUpdate('themeStructure', { ...store.themeStructure, productGrid: val === 'true' })} />
            <EditableField label="Show Footer" value={String(store.themeStructure?.footer ?? true)} onSave={(val) => onUpdate('themeStructure', { ...store.themeStructure, footer: val === 'true' })} />
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

        <div className="mt-6 flex justify-end">
            <Link
                href={`/${locale}/dashboard/settings/theme`}
                className="px-4 py-2 bg-[var(--brand-blue)] text-white rounded-lg hover:bg-[var(--brand-blue-dark)] transition-all"
            >
                Edit Theme
            </Link>
        </div>
        </>
    );
}


