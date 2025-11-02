'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Store, Palette, Globe, FileText, Image as ImageIcon, Info, 
    Edit2, Check, X, Save, ShoppingBag, Navigation, Grid, Shield, Eye
} from 'lucide-react';
import StoreThemePreview from './StoreThemePreview';
import { SerializedStore } from '@/lib/data/store';

// Normalize preview data to match SerializedStore interface
function normalizeStoreDataForPreview(data: StorePreviewData | null): SerializedStore | null {
    if (!data) return null;
    
    // Ensure all required fields from SerializedStore are present
    return {
        _id: data._id || 'preview',
        owner: data.owner || 'preview',
        brandName: data.brandName || '',
        domain: data.domain || '',
        description: data.description || '',
        themeId: typeof data.themeId === 'number' ? data.themeId : parseInt(String(data.themeId || '1'), 10),
        theme: data.theme || { primaryColor: '#3B82F6' },
        themeStructure: data.themeStructure || {
            header: true,
            hero: true,
            about: true,
            trust: true,
            productGrid: true,
            footer: true,
        },
        hero: data.hero || {
            title: '',
            subtitle: '',
            imageUrl: '',
        },
        about: data.about || {
            title: '',
            description: '',
        },
        footer: data.footer || {
            text: '',
        },
        socialLinks: data.socialLinks,
        headerLinks: data.headerLinks || [],
        logoUrl: data.logoUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

interface StorePreviewData {
    brandName?: string;
    domain?: string;
    description?: string;
    themeId?: number;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        textColor?: string;
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
        twitter?: string;
    };
    headerLinks?: Array<{
        label: string;
        href: string;
    }>;
    logoUrl?: string;
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
    const locale = (params?.locale as string) || 'en';
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<any>('');
    const [showThemePreview, setShowThemePreview] = useState(false);

    if (!visible || !data) return null;

    const startEdit = (field: string, currentValue: any) => {
        setEditingField(field);
        setEditValue(currentValue || '');
    };

    const cancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const saveEdit = () => {
        if (editingField) {
            onEdit(editingField, editValue);
            setEditingField(null);
            setEditValue('');
        }
    };

    const EditableField = ({ 
        field, 
        label, 
        value, 
        icon: Icon,
        type = 'text',
        multiline = false 
    }: { 
        field: string; 
        label: string; 
        value: any; 
        icon: any;
        type?: string;
        multiline?: boolean;
    }) => {
        const isEditing = editingField === field;

        return (
            <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold text-gray-700">{label}</span>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => startEdit(field, value)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4 text-indigo-600" />
                        </button>
                    )}
                </div>
                {isEditing ? (
                    <div className="space-y-2">
                        {multiline ? (
                            <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full p-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                rows={3}
                                autoFocus
                            />
                        ) : (
                            <input
                                type={type}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full p-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                autoFocus
                            />
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={saveEdit}
                                className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                            >
                                <Check className="w-3 h-3" />
                                Save
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-900 break-words">
                        {value || <span className="text-gray-400 italic">Not set</span>}
                    </p>
                )}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-xl border-2 border-indigo-200 p-6 mb-6"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900">Store Preview</h3>
                            <p className="text-sm text-gray-600">Review and edit your store information before final submission</p>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4 mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
                        <EditableField
                            field="brandName"
                            label="Brand Name"
                            value={data.brandName}
                            icon={Store}
                        />
                        <EditableField
                            field="domain"
                            label="Domain"
                            value={data.domain}
                            icon={Globe}
                        />
                        <EditableField
                            field="description"
                            label="Description"
                            value={data.description}
                            icon={FileText}
                            multiline
                        />
                    </div>


                    {/* Store Structure */}
                    {data.themeStructure && (
                        <div className="space-y-4 mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Store Structure</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Object.entries(data.themeStructure).map(([key, enabled]) => {
                                    const icons: Record<string, any> = {
                                        header: Navigation,
                                        hero: ImageIcon,
                                        about: Info,
                                        trust: Shield,
                                        productGrid: Grid,
                                        footer: FileText,
                                    };
                                    const Icon = icons[key] || FileText;
                                    const labels: Record<string, string> = {
                                        header: 'Header',
                                        hero: 'Hero',
                                        about: 'About',
                                        trust: 'Trust',
                                        productGrid: 'Products',
                                        footer: 'Footer',
                                    };

                                    return (
                                        <div
                                            key={key}
                                            className={`p-3 rounded-lg border-2 flex items-center gap-2 ${
                                                enabled
                                                    ? 'bg-green-50 border-green-300'
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 ${enabled ? 'text-green-600' : 'text-gray-400'}`} />
                                            <span className={`text-sm font-medium ${enabled ? 'text-green-800' : 'text-gray-500'}`}>
                                                {labels[key] || key}
                                            </span>
                                            {enabled && <Check className="w-4 h-4 text-green-600 ml-auto" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Hero Section */}
                    {data.hero && (
                        <div className="space-y-4 mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Hero Section</h4>
                            <EditableField
                                field="hero.title"
                                label="Hero Title"
                                value={data.hero.title}
                                icon={ImageIcon}
                            />
                            <EditableField
                                field="hero.subtitle"
                                label="Hero Subtitle"
                                value={data.hero.subtitle}
                                icon={FileText}
                            />
                            <EditableField
                                field="hero.imageUrl"
                                label="Hero Image URL"
                                value={data.hero.imageUrl}
                                icon={ImageIcon}
                            />
                        </div>
                    )}

                    {/* About Section */}
                    {data.about && (
                        <div className="space-y-4 mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">About Section</h4>
                            <EditableField
                                field="about.title"
                                label="About Title"
                                value={data.about.title}
                                icon={Info}
                            />
                            <EditableField
                                field="about.description"
                                label="About Description"
                                value={data.about.description}
                                icon={FileText}
                                multiline
                            />
                        </div>
                    )}

                    {/* Footer */}
                    {data.footer && (
                        <div className="space-y-4 mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Footer</h4>
                            <EditableField
                                field="footer.text"
                                label="Footer Text"
                                value={data.footer.text}
                                icon={FileText}
                            />
                        </div>
                    )}

                    {/* Social Links */}
                    {data.socialLinks && (data.socialLinks.facebook || data.socialLinks.instagram || data.socialLinks.twitter) && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Social Links</h4>
                            <div className="flex flex-wrap gap-3">
                                {data.socialLinks.facebook && (
                                    <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                        Facebook
                                    </span>
                                )}
                                {data.socialLinks.instagram && (
                                    <span className="text-xs px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full font-medium">
                                        Instagram
                                    </span>
                                )}
                                {data.socialLinks.twitter && (
                                    <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                        Twitter
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Theme Preview Button */}
                    <div className="pt-4 border-t border-gray-200 mb-4">
                        <motion.button
                            onClick={() => setShowThemePreview(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <Eye className="w-5 h-5" />
                            <span>Preview Your Store Theme</span>
                        </motion.button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            See how your store will look with the generated content
                        </p>
                    </div>
                    
                    {/* Theme Preview Modal */}
                    <StoreThemePreview
                        storeData={normalizeStoreDataForPreview(data)}
                        visible={showThemePreview}
                        onClose={() => setShowThemePreview(false)}
                    />

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSave(data)}
                            disabled={loading}
                            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
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

