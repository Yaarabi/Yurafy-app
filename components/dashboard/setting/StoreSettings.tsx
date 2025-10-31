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
        <SettingsSection title="Store Settings">
            <LogoUploader logoUrl={store.logoUrl || '/logo.png'} onUpload={onUploadLogo} />
            <EditableField label="Favicon URL" value={store.faviconUrl || ''} onSave={(val) => onUpdate('faviconUrl', val)} />
            <EditableField label="Brand Name" value={store.brandName || ''} onSave={(val) => onUpdate('brandName', val)} />
            <EditableField label="Domain" value={store.domain || ''} onSave={(val) => onUpdate('domain', val)} />
            <EditableField label="Description" value={store.description || ''} onSave={(val) => onUpdate('description', val)} />
        </SettingsSection>

        <SettingsSection title="Who We Are">
            <EditableField label="About Description" value={store.whoWeAre?.description || ''} onSave={(val) => onUpdate('whoWeAre', { ...store.whoWeAre, description: val })} />
            <EditableField label="About Image URL" value={store.whoWeAre?.imageUrl || ''} onSave={(val) => onUpdate('whoWeAre', { ...store.whoWeAre, imageUrl: val })} />
        </SettingsSection>

        <SettingsSection title="Hero">
            <EditableField label="Title" value={store.hero?.title || ''} onSave={(val) => onUpdate('hero', { ...store.hero, title: val })} />
            <EditableField label="Subtitle" value={store.hero?.subtitle || ''} onSave={(val) => onUpdate('hero', { ...store.hero, subtitle: val })} />
            <EditableField label="Image URL" value={store.hero?.imageUrl || ''} onSave={(val) => onUpdate('hero', { ...store.hero, imageUrl: val })} />
            <EditableField label="CTA Text" value={store.hero?.ctaText || ''} onSave={(val) => onUpdate('hero', { ...store.hero, ctaText: val })} />
            <EditableField label="CTA Link" value={store.hero?.ctaLink || ''} onSave={(val) => onUpdate('hero', { ...store.hero, ctaLink: val })} />
        </SettingsSection>

        <SettingsSection title="Social Links">
            <EditableField label="Facebook" value={store.socialLinks?.facebook || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, facebook: val })} />
            <EditableField label="Instagram" value={store.socialLinks?.instagram || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, instagram: val })} />
            <EditableField label="Twitter" value={store.socialLinks?.twitter || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, twitter: val })} />
            <EditableField label="LinkedIn" value={store.socialLinks?.linkedin || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, linkedin: val })} />
            <EditableField label="YouTube" value={store.socialLinks?.youtube || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, youtube: val })} />
            <EditableField label="TikTok" value={store.socialLinks?.tiktok || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, tiktok: val })} />
            <EditableField label="WhatsApp" value={store.socialLinks?.whatsapp || ''} onSave={(val) => onUpdate('socialLinks', { ...store.socialLinks, whatsapp: val })} />
        </SettingsSection>

        <SettingsSection title="Customization">
            <EditableField label="Layout (grid|list|masonry)" value={store.customization?.layout || 'grid'} onSave={(val) => onUpdate('customization', { ...store.customization, layout: val as any })} />
            <EditableField label="Show Categories (true/false)" value={String(store.customization?.showCategories ?? true)} onSave={(val) => onUpdate('customization', { ...store.customization, showCategories: val === 'true' })} />
            <EditableField label="Show Filters (true/false)" value={String(store.customization?.showFilters ?? true)} onSave={(val) => onUpdate('customization', { ...store.customization, showFilters: val === 'true' })} />
            <EditableField label="Products Per Page (number)" value={String(store.customization?.productsPerPage ?? 12)} onSave={(val) => onUpdate('customization', { ...store.customization, productsPerPage: parseInt(val || '12', 10) })} />
            <EditableField label="Enable Search (true/false)" value={String(store.customization?.enableSearch ?? true)} onSave={(val) => onUpdate('customization', { ...store.customization, enableSearch: val === 'true' })} />
            <EditableField label="Enable Reviews (true/false)" value={String(store.customization?.enableReviews ?? false)} onSave={(val) => onUpdate('customization', { ...store.customization, enableReviews: val === 'true' })} />
            <EditableField label="Enable Wishlist (true/false)" value={String(store.customization?.enableWishlist ?? false)} onSave={(val) => onUpdate('customization', { ...store.customization, enableWishlist: val === 'true' })} />
            <EditableField label="Enable Compare (true/false)" value={String(store.customization?.enableCompare ?? false)} onSave={(val) => onUpdate('customization', { ...store.customization, enableCompare: val === 'true' })} />
            <EditableField label="Footer Text" value={store.customization?.footerText || ''} onSave={(val) => onUpdate('customization', { ...store.customization, footerText: val })} />
            <EditableField label="Custom CSS" value={store.customization?.customCSS || ''} onSave={(val) => onUpdate('customization', { ...store.customization, customCSS: val })} />
            <EditableField label="Custom JS" value={store.customization?.customJS || ''} onSave={(val) => onUpdate('customization', { ...store.customization, customJS: val })} />
        </SettingsSection>

        <SettingsSection title="SEO">
            <EditableField label="Meta Title" value={store.seo?.metaTitle || ''} onSave={(val) => onUpdate('seo', { ...store.seo, metaTitle: val })} />
            <EditableField label="Meta Description" value={store.seo?.metaDescription || ''} onSave={(val) => onUpdate('seo', { ...store.seo, metaDescription: val })} />
            <EditableField label="Keywords (comma separated)" value={(store.seo?.keywords || []).join(', ')} onSave={(val) => onUpdate('seo', { ...store.seo, keywords: val.split(',').map((k) => k.trim()).filter(Boolean) })} />
            <EditableField label="OG Image URL" value={store.seo?.ogImage || ''} onSave={(val) => onUpdate('seo', { ...store.seo, ogImage: val })} />
        </SettingsSection>

        <SettingsSection title="Business Info">
            <EditableField label="Address" value={store.businessInfo?.address || ''} onSave={(val) => onUpdate('businessInfo', { ...store.businessInfo, address: val })} />
            <EditableField label="City" value={store.businessInfo?.city || ''} onSave={(val) => onUpdate('businessInfo', { ...store.businessInfo, city: val })} />
            <EditableField label="Country" value={store.businessInfo?.country || ''} onSave={(val) => onUpdate('businessInfo', { ...store.businessInfo, country: val })} />
            <EditableField label="Phone" value={store.businessInfo?.phone || ''} onSave={(val) => onUpdate('businessInfo', { ...store.businessInfo, phone: val })} />
            <EditableField label="Email" value={store.businessInfo?.email || ''} onSave={(val) => onUpdate('businessInfo', { ...store.businessInfo, email: val })} />
            <EditableField label="Working Hours" value={store.businessInfo?.workingHours || ''} onSave={(val) => onUpdate('businessInfo', { ...store.businessInfo, workingHours: val })} />
            <EditableField label="Tax ID" value={store.businessInfo?.taxId || ''} onSave={(val) => onUpdate('businessInfo', { ...store.businessInfo, taxId: val })} />
        </SettingsSection>

        <SettingsSection title="Payments & Shipping">
            <EditableField label="Payment Methods (comma separated)" value={(store.paymentMethods || []).join(', ')} onSave={(val) => onUpdate('paymentMethods', val.split(',').map((v) => v.trim()).filter(Boolean))} />
            <EditableField label="Free Shipping Threshold (number)" value={String(store.shippingInfo?.freeShippingThreshold || '')} onSave={(val) => onUpdate('shippingInfo', { ...store.shippingInfo, freeShippingThreshold: val ? Number(val) : undefined })} />
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


