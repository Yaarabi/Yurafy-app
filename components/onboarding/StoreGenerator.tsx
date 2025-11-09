"use client";

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStoreGeneration } from '@/hooks/onboarding/useStoreGeneration';
import { useStoreCreation } from '@/hooks/onboarding/useStoreCreation';
import StorePreviewWithEdit from './ai/components/StorePreviewWithEdit';

interface StoreGeneratorProps {
    selectedTheme: {
        themeId: number;
        theme: { primaryColor: string; secondaryColor?: string; textColor?: string };
    };
    selectedThemeStructure: {
        header: boolean;
        hero: boolean;
        about: boolean;
        trust: boolean;
        productGrid: boolean;
        footer: boolean;
    };
    // ✅ Removed: selectedProductPageStructure - no longer needed
    basicInfo: {
        brandName: string;
        domain: string;
        description: string;
        logo?: string;
        language?: string;
    };
    plan?: string;
    onBack?: () => void;
}

export default function StoreGenerator({
    selectedTheme,
    selectedThemeStructure,
    basicInfo,
    plan,
    onBack,
}: StoreGeneratorProps) {
    const params = useParams();
    const localeRaw = String((params?.locale as string) || 'en');
    const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';

    // Use store generation hook
    const {
        storeData,
        generating,
        error,
        generateStore,
        updateField,
    } = useStoreGeneration({
        basicInfo,
        selectedTheme,
        selectedThemeStructure,
        autoGenerate: true,
    });

    // Use store creation hook
    const {
        createStore,
        creating: saving,
    } = useStoreCreation({
        plan,
        locale,
    });

    const handleEditField = (field: string, value: any) => {
        updateField(field, value);
    };

    const handleSaveAndRedirect = async (data: any) => {
        if (!storeData) {
                return;
            }

        // Use current storeData state (which includes any user edits)
        const dataToSave = storeData || data;
        
        await createStore({
            brandName: dataToSave.brandName,
            domain: dataToSave.domain,
            description: dataToSave.description,
                    language: basicInfo.language || 'en',
            themeId: selectedTheme.themeId,
            theme: selectedTheme.theme,
                    themeStructure: selectedThemeStructure || {
                        header: true,
                        hero: true,
                        about: true,
                        trust: true,
                        productGrid: true,
                        footer: true,
                    },
            hero: dataToSave.hero || {
                title: '',
                subtitle: '',
                imageUrl: '',
            },
            about: dataToSave.about || {
                title: '',
                description: '',
            },
            footer: dataToSave.footer || {
                text: `© ${new Date().getFullYear()} ${dataToSave.brandName}. All rights reserved.`,
                },
                socialLinks: dataToSave.socialLinks || {},
                headerLinks: dataToSave.headerLinks || [],
            whatsappNumber: dataToSave.whatsappNumber,
            logoUrl: basicInfo.logo || dataToSave.logoUrl,
        });
    };

    // Show loading state while generating
    if (generating && !storeData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div 
                        className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                        style={{ borderColor: selectedTheme.theme.primaryColor }}
                    ></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Store</h2>
                    <p className="text-gray-600">Please wait while we create your store...</p>
                </motion.div>
            </div>
        );
    }

    // Show error state only if there's an error and no storeData
    if (error && !storeData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Generation Failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Go Back
                            </button>
                        )}
                        <button
                            onClick={generateStore}
                            className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                            style={{ backgroundColor: selectedTheme.theme.primaryColor }}
                        >
                            Try Again
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Show preview - if storeData exists, show it; otherwise show waiting message
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
                {storeData ? (
                    <StorePreviewWithEdit
                        data={storeData}
                        visible={true}
                        onSave={handleSaveAndRedirect}
                        onEdit={handleEditField}
                        loading={saving}
                    />
                ) : (
                    <div className="bg-white rounded-xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Preparing Preview</h2>
                        <p className="text-gray-600">Please wait while we prepare your store preview...</p>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="mt-4 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Go Back
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

