"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import StorePreviewWithEdit from './ai/components/StorePreviewWithEdit';

// Normalize store data to ensure all required fields are present
function normalizeStoreData(data: any, selectedTheme?: any, selectedThemeStructure?: any): any {
    return {
        ...data,
        brandName: data.brandName || '',
        domain: data.domain || '',
        description: data.description || '',
        themeId: typeof data.themeId === 'number' ? data.themeId : (selectedTheme?.themeId || parseInt(String(data.themeId || '1'), 10)),
        theme: data.theme || selectedTheme?.theme || { primaryColor: '#3B82F6' },
        themeStructure: data.themeStructure || selectedThemeStructure || {
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
        socialLinks: data.socialLinks || {},
        headerLinks: data.headerLinks || [],
        logoUrl: data.logoUrl || undefined,
    };
}

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
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    // ✅ FIX: Get locale from params (URL path) instead of searchParams, normalize it
    const localeRaw = String((params?.locale as string) || searchParams.get('locale') || 'en');
    const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';

    const [generating, setGenerating] = useState(true);
    const [storeData, setStoreData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Auto-generate store on mount
    useEffect(() => {
        generateStore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const generateStore = async () => {
        setGenerating(true);
        setError(null);

        try {
            // ✅ FIXED: Use Gemini agent to generate hero, about, and footer content
            const response = await fetch('/api/onboarding/generate-store-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandName: basicInfo.brandName,
                    description: basicInfo.description,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.error || 'Failed to generate store');
                toast.error(data.error || 'Failed to generate store');
                return;
            }

            // ✅ FIXED: Use generated content from Gemini agent and merge with basic info
            let storeDataFromResponse = null;
            
            // Priority 1: Direct storeData from API response (Gemini-generated content)
            if (data.storeData) {
                // Merge with basic info and theme
                storeDataFromResponse = {
                    ...data.storeData,
                    domain: basicInfo.domain,
                    themeId: selectedTheme?.themeId || 1,
                    theme: selectedTheme?.theme || { primaryColor: '#3B82F6' },
                    themeStructure: selectedThemeStructure || {
                        header: true,
                        hero: true,
                        about: true,
                        trust: true,
                        productGrid: true,
                        footer: true,
                    },
                    logoUrl: basicInfo.logo || undefined,
                };
            }
            // Priority 2: Try to parse JSON from agent's message response
            else if (data.success && data.message) {
                try {
                    // Try to find JSON object in the message
                    const message = data.message.trim();
                    
                    // Look for JSON object (could be wrapped in markdown code blocks or plain JSON)
                    let jsonString = message;
                    
                    // Remove markdown code blocks if present
                    if (message.includes('```json')) {
                        jsonString = message.split('```json')[1].split('```')[0].trim();
                    } else if (message.includes('```')) {
                        jsonString = message.split('```')[1].split('```')[0].trim();
                    } else {
                        // Try to find JSON object boundaries
                        const jsonMatch = message.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            jsonString = jsonMatch[0];
                        }
                    }
                    
                    // Parse the JSON
                    const parsed = JSON.parse(jsonString);
                    if (parsed && (parsed.brandName || parsed.hero || parsed.about)) {
                        storeDataFromResponse = parsed;
                    }
                } catch (e) {
                    // Silent failure - will use fallback
                }
            }
            
            // Fallback: If no data found, construct minimal data from basicInfo
            if (!storeDataFromResponse && data.success) {
                storeDataFromResponse = {
                    brandName: basicInfo.brandName,
                    domain: basicInfo.domain,
                    description: basicInfo.description,
                    themeId: selectedTheme?.themeId || 1,
                    theme: selectedTheme?.theme || { primaryColor: '#3B82F6' },
                    themeStructure: selectedThemeStructure || {
                        header: true,
                        hero: true,
                        about: true,
                        trust: true,
                        productGrid: true,
                        footer: true,
                    },
                    hero: {
                        title: `Welcome to ${basicInfo.brandName}`,
                        subtitle: basicInfo.description.substring(0, 100) || 'Discover our amazing products',
                        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
                    },
                    about: {
                        title: `About ${basicInfo.brandName}`,
                        description: basicInfo.description || '',
                    },
                    footer: {
                        text: `© ${new Date().getFullYear()} ${basicInfo.brandName}. All rights reserved.`,
                    },
                    socialLinks: {},
                    headerLinks: [],
                    logoUrl: basicInfo.logo || undefined,
                };
            }
            
            // Normalize storeData to ensure all required fields are present
            if (storeDataFromResponse) {
                storeDataFromResponse = normalizeStoreData(storeDataFromResponse, selectedTheme, selectedThemeStructure);
            }
            
            if (storeDataFromResponse) {
                setStoreData(storeDataFromResponse);
                setGenerating(false); // Ensure generating is false so preview shows
                toast.success('Store content generated successfully!');
                return;
            }
            
            // If API response was successful but no data found even after fallback, show error
            if (data.success && !storeDataFromResponse) {
                setError('Store content was generated but data format is unexpected. Please try again.');
                toast.error('Generation incomplete. Please try again.');
                setGenerating(false);
                return;
            }
            
            // Only set error if API call actually failed
            if (!data.success) {
                setError(data.error || 'Failed to generate store content');
                toast.error(data.error || 'Failed to generate store content');
            } else if (!basicInfo) {
                // This shouldn't happen, but if basicInfo is missing, show error
                setError('Missing store information. Please go back and fill in all required fields.');
                toast.error('Missing store information.');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
            toast.error('Something went wrong. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleEditField = (field: string, value: any) => {
        if (!storeData) return;
        
        const fieldParts = field.split('.');
        if (fieldParts.length === 2) {
            const [parent, child] = fieldParts;
            setStoreData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setStoreData((prev: any) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleSaveAndRedirect = async (data: any) => {
        setSaving(true);
        try {
            // Always use the current storeData state (which includes any user edits)
            // The data parameter might be stale if user made edits
            const currentData = storeData || data;
            
            // Ensure we pass the normalized store data (with all agent-generated content)
            const dataToSave = normalizeStoreData(currentData, selectedTheme, selectedThemeStructure);
            
            // Transform data to match store API format
            const storePayload = {
                brandName: dataToSave.brandName,
                domain: dataToSave.domain,
                description: dataToSave.description,
                themeId: selectedTheme?.themeId || dataToSave.themeId || 1,
                theme: {
                    primaryColor: selectedTheme?.theme?.primaryColor || dataToSave.theme?.primaryColor || '#3B82F6',
                    secondaryColor: selectedTheme?.theme?.secondaryColor || dataToSave.theme?.secondaryColor,
                    textColor: selectedTheme?.theme?.textColor || dataToSave.theme?.textColor,
                },
                themeStructure: selectedThemeStructure || dataToSave.themeStructure || {
                    header: true,
                    hero: true,
                    about: true,
                    trust: true,
                    productGrid: true,
                    footer: true,
                },
                hero: {
                    title: dataToSave.hero?.title || '',
                    subtitle: dataToSave.hero?.subtitle || '',
                    imageUrl: dataToSave.hero?.imageUrl || '',
                },
                about: {
                    title: dataToSave.about?.title || '',
                    description: dataToSave.about?.description || '',
                },
                footer: {
                    text: dataToSave.footer?.text || '',
                },
                socialLinks: dataToSave.socialLinks || {},
                headerLinks: dataToSave.headerLinks || [],
            };

            // Send to store API
            const response = await fetch('/api/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storePayload),
            });

            const responseData = await response.json();

            if (response.ok && responseData.store) {
                toast.success('Store created successfully!');
                // Check if plan is free - redirect to dashboard
                if (plan === 'free') {
                    setTimeout(() => {
                        router.push(`/${locale}/dashboard`);
                    }, 500);
                } else {
                    // Redirect to checkout for paid plans
                    toast.success('Redirecting to checkout...');
                    setTimeout(() => {
                        router.push(`/${locale}/onboarding/checkout?plan=${plan || 'Starter'}`);
                    }, 500);
                }
            } else {
                // Handle domain already exists error
                if (response.status === 400 && responseData.error?.includes('Domain already exists')) {
                    toast.error('A store with this domain already exists. Please choose a different domain.');
                } else {
                    toast.error(responseData.error || 'Failed to save store');
                }
                if (plan !== 'free') {
                    return;
                }
            }
        } catch (error) {
            console.error('Error saving store:', error);
            toast.error('Something went wrong while saving. Please try again.');
        } finally {
            setSaving(false);
        }
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

