'use client';

import { useState, useMemo, type ComponentType, type SVGProps } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, FileText, Image as ImageIcon, Info, Eye, Phone, Save, Store } from 'lucide-react';
import StoreThemePreview from './StoreThemePreview';
import EditableField from './EditableField';
import PreviewSection from './PreviewSection';
import StorePreviewHeader from './StorePreviewHeader';
import { SerializedStore } from '@/lib/data/store';

// Normalize preview data to match SerializedStore interface
function normalizeStoreDataForPreview(data: StorePreviewData | null, fallbackLanguage: string): SerializedStore | null {
    if (!data) return null;
    
    // Ensure all required fields from SerializedStore are present
    return {
        _id: data._id || 'preview',
        owner: data.owner || 'preview',
        brandName: data.brandName || '',
        domain: data.domain || '',
        description: data.description || '',
        language: data.language || fallbackLanguage,
        themeId: typeof data.themeId === 'number' ? data.themeId : parseInt(String(data.themeId || '1'), 10),
        theme: {
            primaryColor: data.theme?.primaryColor || '#3B82F6',
            secondaryColor: data.theme?.secondaryColor,
            textColor: data.theme?.textColor,
            surfaceColor: data.theme?.surfaceColor,
        },
        themeStructure: {
            header: data.themeStructure?.header ?? true,
            hero: data.themeStructure?.hero ?? true,
            about: data.themeStructure?.about ?? true,
            trust: data.themeStructure?.trust ?? true,
            productGrid: data.themeStructure?.productGrid ?? true,
            footer: data.themeStructure?.footer ?? true,
        },
        hero: {
            title: data.hero?.title ?? '',
            subtitle: data.hero?.subtitle ?? '',
            imageUrl: data.hero?.imageUrl ?? '',
        },
        about: {
            title: data.about?.title ?? '',
            description: data.about?.description ?? '',
        },
        footer: {
            text: data.footer?.text ?? '',
        },
        socialLinks: data.socialLinks,
        headerLinks: data.headerLinks || [],
        logoUrl: data.logoUrl,
        whatsappNumber: data.whatsappNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

interface StorePreviewData {
    brandName?: string;
    domain?: string;
    description?: string;
    language?: string;
    themeId?: number;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        textColor?: string;
        surfaceColor?: string;
    };
    themeStructure?: {
        header?: boolean;
        hero?: boolean;
        about?: boolean;
        trust?: boolean;
        productGrid?: boolean;
        footer?: boolean;
    };
    hero?: {
        title?: string;
        subtitle?: string;
        imageUrl?: string;
    };
    about?: {
        title?: string;
        description?: string;
    };
    footer?: {
        text?: string;
    };
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        tiktok?: string;
    };
    headerLinks?: Array<{
        label: string;
        href: string;
    }>;
    logoUrl?: string;
    whatsappNumber?: string;
    _id?: string;
    owner?: string;
}

interface StorePreviewWithEditProps {
    data: StorePreviewData | null;
    visible: boolean;
    onSave: (data: StorePreviewData) => Promise<void>;
    onEdit: (field: string, value: any) => void;
    loading?: boolean;
}

export default function StorePreviewWithEdit({ 
    data, 
    visible, 
    onSave, 
    onEdit,
    loading = false 
}: StorePreviewWithEditProps) {
    const params = useParams();
    const rawLocale = params?.locale;
    const localeCandidate = Array.isArray(rawLocale) ? rawLocale[0] : rawLocale;
    const locale = (typeof localeCandidate === 'string' && localeCandidate.length > 0
        ? localeCandidate
        : 'en').split('-')[0]?.toLowerCase() || 'en';
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [showThemePreview, setShowThemePreview] = useState(false);

    if (!visible || !data) return null;

    const handleStartEdit = (field: string, currentValue: string | number | null | undefined) => {
        setEditingField(field);
        setEditValue(typeof currentValue === 'string' ? currentValue : currentValue ? String(currentValue) : '');
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const handleEditChange = (value: string) => {
        setEditValue(value);
    };

    const handleSaveEdit = (field: string) => {
        if (!field || editingField !== field) return;

        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            if (!child) return;

            if (parent === 'socialLinks') {
                onEdit('socialLinks', {
                    ...(data.socialLinks || {}),
                    [child]: editValue,
                });
            } else if (parent === 'hero') {
                onEdit('hero', {
                    ...(data.hero || {}),
                    [child]: editValue,
                });
            } else if (parent === 'about') {
                onEdit('about', {
                    ...(data.about || {}),
                    [child]: editValue,
                });
            } else if (parent === 'footer') {
                onEdit('footer', {
                    ...(data.footer || {}),
                    [child]: editValue,
                });
            }
        } else {
            onEdit(field, editValue);
        }

        setEditingField(null);
        setEditValue('');
    };

    type FieldConfig = {
        field: string;
        label: string;
        value: string | number | null | undefined;
        icon: ComponentType<SVGProps<SVGSVGElement>>;
        type?: string;
        multiline?: boolean;
    };

    const sections = useMemo(() => {
        const result: Array<{ title: string; fields: FieldConfig[] }> = [];

        const basicInformation: FieldConfig[] = [
            // brandName & domain now static (non-editable) -> omit from editable fields
            { field: 'description', label: 'Description', value: data.description, icon: FileText, multiline: true },
            { field: 'whatsappNumber', label: 'WhatsApp Number', value: data.whatsappNumber || '', icon: Phone, type: 'tel' },
        ];

        result.push({ title: 'Basic Information', fields: basicInformation });

        if (data.hero) {
            result.push({
                title: 'Hero Section',
                fields: [
                    { field: 'hero.title', label: 'Hero Title', value: data.hero.title, icon: ImageIcon },
                    { field: 'hero.subtitle', label: 'Hero Subtitle', value: data.hero.subtitle, icon: FileText },
                    { field: 'hero.imageUrl', label: 'Hero Image URL', value: data.hero.imageUrl, icon: ImageIcon },
                ],
            });
        }

        if (data.about) {
            result.push({
                title: 'About Section',
                fields: [
                    { field: 'about.title', label: 'About Title', value: data.about.title, icon: Info },
                    { field: 'about.description', label: 'About Description', value: data.about.description, icon: FileText, multiline: true },
                ],
            });
        }

        const socialFields: FieldConfig[] = [
            { field: 'socialLinks.facebook', label: 'Facebook URL', value: data.socialLinks?.facebook || '', icon: Globe, type: 'url' },
            { field: 'socialLinks.instagram', label: 'Instagram URL', value: data.socialLinks?.instagram || '', icon: Globe, type: 'url' },
            { field: 'socialLinks.tiktok', label: 'TikTok URL', value: data.socialLinks?.tiktok || '', icon: Globe, type: 'url' },
        ];

        result.push({ title: 'Social Links', fields: socialFields });

        return result;
    }, [data]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="mx-auto w-full max-w-4xl rounded-xl border border-indigo-100 bg-white p-4 shadow-lg sm:p-6"
                >
                    <StorePreviewHeader
                        title="Store Preview"
                        subtitle="Review and edit your store information before final submission"
                    />

                    <div className="space-y-5">
                        {/* Static (non-editable) primary info */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Brand Name</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">{data.brandName || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Domain</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">{data.domain || '—'}</p>
                                </div>
                            </div>
                        </div>
                        {sections.map((section) => (
                            <PreviewSection key={section.title} title={section.title}>
                                {section.fields.map((fieldConfig) => (
                                    <EditableField
                                        key={fieldConfig.field}
                                        field={fieldConfig.field}
                                        label={fieldConfig.label}
                                        value={fieldConfig.value}
                                        icon={fieldConfig.icon}
                                        type={fieldConfig.type}
                                        multiline={fieldConfig.multiline}
                                        isEditing={editingField === fieldConfig.field}
                                        editValue={editingField === fieldConfig.field ? editValue : ''}
                                        onStartEdit={handleStartEdit}
                                        onSave={handleSaveEdit}
                                        onCancel={handleCancelEdit}
                                        onChange={handleEditChange}
                                    />
                                ))}
                            </PreviewSection>
                        ))}
                    </div>

                    {/* Theme Preview Button */}
                    <div className="mb-4 border-t border-gray-200 pt-4">
                        <motion.button
                            onClick={() => setShowThemePreview(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 touch-manipulation hover:shadow-lg sm:text-base"
                        >
                            <Eye className="h-5 w-5" />
                            <span>Preview Your Store Theme</span>
                        </motion.button>
                        <p className="mt-2 px-2 text-center text-xs text-gray-500">
                            See how your store will look with the generated content
                        </p>
                    </div>
                    
                    {/* Theme Preview Modal */}
                    <StoreThemePreview
                        storeData={normalizeStoreDataForPreview(data, locale)}
                        visible={showThemePreview}
                        onClose={() => setShowThemePreview(false)}
                    />

                    {/* Submit Button */}
                    <div className="border-t border-gray-200 pt-5">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSave(data)}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 touch-manipulation hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
                        >
                            {loading ? (
                                <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    <span>Continue to Checkout</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

