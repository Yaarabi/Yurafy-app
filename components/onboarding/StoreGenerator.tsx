"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
        logo?: string;
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
            // Create prompt for agent to generate store content (DO NOT save yet)
            const generationPrompt = `Generate complete store content and show it in a preview. DO NOT save the store yet - just generate the content.

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

CRITICAL: After generating all the content, you MUST respond with ONLY a valid JSON object containing all the store data. Do NOT use any tools. Do NOT write explanatory text. Respond ONLY with the JSON object.

MANDATORY RESPONSE FORMAT: Your entire response must be a valid JSON object in this exact format:

{
  "brandName": "${basicInfo.brandName}",
  "domain": "${basicInfo.domain}",
  "description": "IMPROVED description based on user's input (80-150 words, engaging and professional)",
  "themeId": ${selectedTheme?.themeId || 1},
  "theme": ${JSON.stringify(selectedTheme?.theme || { primaryColor: '#3B82F6' })},
  "themeStructure": ${JSON.stringify(selectedThemeStructure || { header: true, hero: true, about: true, trust: true, productGrid: true, footer: true })},
  "hero": {
    "title": "IMPROVED compelling headline (5-10 words)",
    "subtitle": "IMPROVED catchy tagline (10-20 words)",
    "imageUrl": "high-quality Unsplash URL based on business type"
  },
  "about": {
    "title": "About ${basicInfo.brandName}",
    "description": "IMPROVED and EXPANDED description (80-150 words, engaging, professional, compelling)"
  },
  "footer": {
    "text": "Copyright notice or brand message"
  },
  "headerLinks": [
    {"label": "About", "href": "#about"},
    {"label": "Products", "href": "#products"},
    {"label": "Contact", "href": "#contact"}
  ],
  "socialLinks": {
    "facebook": "https://www.facebook.com/[brand-name-formatted]",
    "instagram": "https://www.instagram.com/[brand-name-formatted]",
    "twitter": "https://twitter.com/[brand-name-formatted]"
  }
}

IMPORTANT: 
- Replace [IMPROVED] and [brand-name-formatted] with actual generated content
- Format brand name for URLs: lowercase, replace spaces with hyphens, remove special characters
- Generate actual Unsplash image URLs based on business type
- Generate at least 1-2 social media links
- Respond with ONLY the JSON object, no other text

Do NOT ask questions. Do NOT use tools. Just respond with the JSON object.`;

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

            if (!data.success) {
                setError(data.error || 'Failed to generate store');
                toast.error(data.error || 'Failed to generate store');
                return;
            }

            // Extract store data from agent response
            let storeDataFromResponse = null;
            
            // Priority 1: Direct storeData from API response
            if (data.storeData) {
                storeDataFromResponse = data.storeData;
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
            
            // Always save when user clicks submit (they've reviewed and confirmed)
            const response = await fetch('/api/onboarding/ai-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "Save store with these details",
                    plan: plan || 'Starter',
                    selectedTheme,
                    selectedThemeStructure,
                    selectedProductPageStructure,
                    finalStoreData: dataToSave, // Use normalized data with all agent-generated content
                }),
            });

            const responseData = await response.json();

            // For free plan, even if store already exists, we still need to complete onboarding
            if (responseData.success && (responseData.storeCreated || plan === 'free')) {
                if (plan === 'free') {
                    toast.success('Store created successfully!');
                } else {
                    toast.success('Store updated successfully!');
                }
            } else if (responseData.success) {
                // Store already exists, but that's okay for free plan
                if (plan === 'free') {
                    toast.success('Store saved successfully!');
                } else {
                    toast.error(responseData.error || 'Failed to update store');
                    return;
                }
            } else {
                toast.error(responseData.error || 'Failed to save store');
                if (plan !== 'free') {
                    return;
                }
            }
            
            // Check if plan is free - redirect to dashboard (onboardingCompleted is set in API)
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
        } catch (error) {
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

