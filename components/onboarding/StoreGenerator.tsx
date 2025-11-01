"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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
    selectedProductPageStructure: {
        productDetails: boolean;
        productImages: boolean;
        productDescription: boolean;
        productPrice: boolean;
        productVariants: boolean;
        orderForm: boolean;
        relatedProducts: boolean;
        reviews: boolean;
    };
    basicInfo: {
        brandName: string;
        domain: string;
        description: string;
    };
    plan?: string;
    onBack?: () => void;
}

export default function StoreGenerator({
    selectedTheme,
    selectedThemeStructure,
    selectedProductPageStructure,
    basicInfo,
    plan,
    onBack,
}: StoreGeneratorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = searchParams.get('locale') || 'en';

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
            // Create prompt for agent to generate and save store
            const generationPrompt = `Generate a complete store setup and save it immediately.

Given Information:
- Brand Name: ${basicInfo.brandName}
- Domain: ${basicInfo.domain}
- Description: ${basicInfo.description}
${selectedTheme ? `- Selected Theme: #${selectedTheme.themeId} with primary color ${selectedTheme.theme.primaryColor}${selectedTheme.theme.secondaryColor ? `, secondary color ${selectedTheme.theme.secondaryColor}` : ''}${selectedTheme.theme.textColor ? `, text color ${selectedTheme.theme.textColor}` : ''}` : ''}
${selectedThemeStructure ? `- Store Structure: header=${selectedThemeStructure.header}, hero=${selectedThemeStructure.hero}, about=${selectedThemeStructure.about}, trust=${selectedThemeStructure.trust}, productGrid=${selectedThemeStructure.productGrid}, footer=${selectedThemeStructure.footer}` : ''}

REQUIRED: Generate all of the following NOW and IMPROVE them based on the description "${basicInfo.description}":
1. Hero section (IMPROVE the descriptions):
   - Title: Create a compelling, professional headline for ${basicInfo.brandName} based on "${basicInfo.description}" (5-10 words, engaging and brand-focused)
   - Subtitle: Create an improved catchy tagline or value proposition based on "${basicInfo.description}" (10-20 words, persuasive and clear)
   - Image URL: A relevant Unsplash image URL based on the business type from description "${basicInfo.description}" (use specific, high-quality Unsplash URLs)

2. About section (IMPROVE and expand the description):
   - Title: "About ${basicInfo.brandName}" or similar professional title
   - Description: IMPROVE and EXPAND on "${basicInfo.description}" - make it 80-150 words, engaging, professional, and compelling. Add details about what makes ${basicInfo.brandName} unique, the brand's values or mission, and what customers can expect.

3. Footer:
   - Text: Copyright notice or brand message for ${basicInfo.brandName}

4. Header links: Generate 3-5 relevant navigation links (e.g., Home: "/", Products: "/products", About: "/about", Contact: "/contact")

5. Social media links (GENERATE ACTUAL LINKS):
   - Based on the business type from "${basicInfo.description}", generate realistic social media profile URLs:
     * Facebook: https://www.facebook.com/[brand-name-formatted] (format: lowercase, hyphens, no spaces)
     * Instagram: https://www.instagram.com/[brand-name-formatted] (format: lowercase, no spaces, hyphens only)
     * Twitter/X: https://twitter.com/[brand-name-formatted] or https://x.com/[brand-name-formatted] (format: lowercase, no spaces, hyphens only)
   - IMPORTANT: Generate actual working URLs based on the brand name "${basicInfo.brandName}". Format the brand name for URLs (lowercase, replace spaces with hyphens, remove special characters)
   - Generate at least 1-2 social links

CRITICAL: After generating all the content, IMMEDIATELY use the save_store tool to save the store with ALL the generated data:
- brandName: "${basicInfo.brandName}"
- domain: "${basicInfo.domain}"
- description: "${basicInfo.description}"
- themeId: ${selectedTheme?.themeId || 1}
- theme: ${JSON.stringify(selectedTheme?.theme || { primaryColor: '#3B82F6' })}
- themeStructure: ${JSON.stringify(selectedThemeStructure || { header: true, hero: true, about: true, trust: true, productGrid: true, footer: true })}
- hero: {title (IMPROVED), subtitle (IMPROVED), imageUrl}
- about: {title, description (IMPROVED and EXPANDED - 80-150 words)}
- footer: {text}
- headerLinks: array of {label, href} (3-5 links)
- socialLinks: {facebook, instagram, twitter} (GENERATE ACTUAL URLs)

Do NOT ask questions. Just generate, improve descriptions, and save the store NOW.`;

            const response = await fetch('/api/onboarding/ai-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: generationPrompt,
                    plan: plan || 'Starter',
                    selectedTheme,
                    selectedThemeStructure,
                    selectedProductPageStructure,
                }),
            });

            const data = await response.json();
            
            // Debug logging
            console.log('API Response:', {
                success: data.success,
                storeCreated: data.storeCreated,
                hasStoreData: !!data.storeData,
                message: data.message?.substring(0, 100),
            });

            if (!data.success) {
                setError(data.error || 'Failed to generate store');
                toast.error(data.error || 'Failed to generate store');
                return;
            }

            // Check if store was created or if we have store data
            const isStoreCreated = data.storeCreated || data.message?.includes('✅ Store') || data.message?.includes('has been created successfully');
            
            // If we have store data, use it directly
            if (data.storeData && data.storeData._id) {
                setStoreData(data.storeData);
                toast.success('Store generated and saved successfully!');
                return;
            }
            
            // If store was created but no storeData, or if we're not sure, try fetching from database
            if (isStoreCreated || data.success) {
                // Fetch the saved store from API as fallback
                try {
                    const storeResponse = await fetch('/api/store/owner', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    
                    if (storeResponse.ok) {
                        const storeResponseData = await storeResponse.json();
                        if (storeResponseData && storeResponseData._id) {
                            setStoreData(storeResponseData);
                            toast.success('Store generated and saved successfully!');
                            return;
                        }
                    }
                    
                    // If fetch failed but we think store was created, show error
                    if (isStoreCreated) {
                        setError('Store was created but could not be retrieved. Please try again.');
                        toast.error('Store was created but could not be retrieved.');
                    } else {
                        setError(data.error || 'Failed to generate or save store');
                        toast.error(data.error || 'Failed to generate or save store');
                    }
                } catch (fetchError) {
                    console.error('Error fetching store:', fetchError);
                    if (isStoreCreated) {
                        setError('Store was created but could not be retrieved. Please try again.');
                        toast.error('Store was created but could not be retrieved.');
                    } else {
                        setError(data.error || 'Failed to generate or save store');
                        toast.error(data.error || 'Failed to generate or save store');
                    }
                }
            } else {
                // Agent responded but didn't save the store yet
                setError(data.error || 'Failed to generate or save store');
                toast.error(data.error || 'Failed to generate or save store');
            }
        } catch (error) {
            console.error('Error generating store:', error);
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
            // Check if data has been modified - compare with original storeData
            const hasChanges = data && JSON.stringify(data) !== JSON.stringify(storeData);
            
            if (hasChanges) {
                // Update the store with any edits made in the preview
                const response = await fetch('/api/onboarding/ai-setup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: "Save store with these details",
                        plan: plan || 'Starter',
                        selectedTheme,
                        selectedThemeStructure,
                        selectedProductPageStructure,
                        finalStoreData: data || storeData,
                    }),
                });

                const responseData = await response.json();

                if (responseData.success && responseData.storeCreated) {
                    toast.success('Store updated successfully!');
                } else {
                    toast.error(responseData.error || 'Failed to update store');
                    return;
                }
            }
            
            // Redirect to checkout
            toast.success('Redirecting to checkout...');
            setTimeout(() => {
                router.push(`/${locale}/onboarding/checkout?plan=${plan || 'Starter'}`);
            }, 500);
        } catch (error) {
            console.error('Error saving store:', error);
            toast.error('Something went wrong while saving. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Show loading state while generating
    if (generating) {
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

    // Show error state
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

    // Show preview with edit
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
                <StorePreviewWithEdit
                    data={storeData}
                    visible={!!storeData}
                    onSave={handleSaveAndRedirect}
                    onEdit={handleEditField}
                    loading={saving}
                />
            </div>
        </div>
    );
}

