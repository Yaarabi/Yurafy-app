import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

interface BasicInfo {
    brandName: string;
    domain: string;
    description: string;
    logo?: string;
    language?: string;
}

interface SelectedTheme {
    themeId: number;
    theme: {
        primaryColor: string;
        secondaryColor?: string;
        textColor?: string;
        surfaceColor?: string;
    };
}

interface ThemeStructure {
    header: boolean;
    hero: boolean;
    about: boolean;
    trust: boolean;
    productGrid: boolean;
    footer: boolean;
}

interface UseStoreGenerationOptions {
    basicInfo: BasicInfo;
    selectedTheme: SelectedTheme;
    selectedThemeStructure?: ThemeStructure;
    autoGenerate?: boolean;
}

export function useStoreGeneration(options: UseStoreGenerationOptions) {
    const { basicInfo, selectedTheme, selectedThemeStructure, autoGenerate = true } = options;
    
    const [generating, setGenerating] = useState(false);
    const [storeData, setStoreData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const hasGeneratedRef = useRef(false);

    const generateStore = useCallback(async () => {
        // Validate basicInfo before generating
        if (!basicInfo?.brandName || !basicInfo?.description) {
            console.error('[useStoreGeneration] Cannot generate store: missing brandName or description', basicInfo);
            setError('Missing required information: brand name and description are required');
            return;
        }

        setGenerating(true);
        setError(null);

        try {
            console.log('[useStoreGeneration] Calling API to generate store content', {
                brandName: basicInfo.brandName,
                description: basicInfo.description.substring(0, 50) + '...',
                language: basicInfo.language || 'en',
            });

            const response = await fetch('/api/onboarding/generate-store-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandName: basicInfo.brandName,
                    description: basicInfo.description,
                    language: basicInfo.language || 'en',
                }),
            });

            const data = await response.json();

            console.log('[useStoreGeneration] API response', { success: data.success, hasStoreData: !!data.storeData });

            if (!data.success) {
                const errorMessage = data.error || 'Failed to generate store content';
                console.error('[useStoreGeneration] API error', errorMessage);
                setError(errorMessage);
                toast.error(errorMessage);
                return;
            }

            // Process the response data
            let storeDataFromResponse = null;
            
            // Priority 1: Direct storeData from API response
            if (data.storeData) {
                storeDataFromResponse = {
                    ...data.storeData,
                    domain: basicInfo.domain,
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
                    footer: data.storeData.footer || {
                        text: `© ${new Date().getFullYear()} ${data.storeData.brandName || basicInfo.brandName}. All rights reserved.`,
                    },
                    logoUrl: basicInfo.logo || undefined,
                };
            }
            // Priority 2: Try to parse JSON from message
            else if (data.success && data.message) {
                try {
                    let jsonString = data.message.trim();
                    
                    // Remove markdown code blocks if present
                    if (jsonString.includes('```json')) {
                        jsonString = jsonString.split('```json')[1].split('```')[0].trim();
                    } else if (jsonString.includes('```')) {
                        jsonString = jsonString.split('```')[1].split('```')[0].trim();
                    } else {
                        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            jsonString = jsonMatch[0];
                        }
                    }
                    
                    const parsed = JSON.parse(jsonString);
                    if (parsed && (parsed.brandName || parsed.hero || parsed.about)) {
                        storeDataFromResponse = {
                            ...parsed,
                            domain: basicInfo.domain,
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
                            footer: parsed.footer || {
                                text: `© ${new Date().getFullYear()} ${parsed.brandName || basicInfo.brandName}. All rights reserved.`,
                            },
                            logoUrl: basicInfo.logo || undefined,
                        };
                    }
                } catch (e) {
                    // Silent failure - will use fallback
                }
            }
            
            // Fallback: Construct minimal data from basicInfo
            if (!storeDataFromResponse && data.success) {
                storeDataFromResponse = {
                    brandName: basicInfo.brandName,
                    domain: basicInfo.domain,
                    description: basicInfo.description,
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
            
            if (storeDataFromResponse) {
                setStoreData(storeDataFromResponse);
                toast.success('Store content generated successfully!');
            } else {
                const errorMessage = 'Store content was generated but data format is unexpected. Please try again.';
                setError(errorMessage);
                toast.error('Generation incomplete. Please try again.');
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Something went wrong. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setGenerating(false);
        }
    }, [basicInfo, selectedTheme, selectedThemeStructure]);

    // Auto-generate on mount if enabled and basicInfo is available
    useEffect(() => {
        // Only generate once when:
        // 1. Auto-generate is enabled
        // 2. We haven't generated yet (tracked by ref)
        // 3. We don't have storeData yet
        // 4. We're not already generating
        // 5. basicInfo has the required fields
        if (
            autoGenerate && 
            !hasGeneratedRef.current && 
            !storeData && 
            !generating && 
            basicInfo?.brandName && 
            basicInfo?.description
        ) {
            console.log('[useStoreGeneration] Triggering store generation', {
                brandName: basicInfo.brandName,
                hasDescription: !!basicInfo.description,
            });
            hasGeneratedRef.current = true;
            generateStore();
        } else if (autoGenerate && !hasGeneratedRef.current) {
            console.log('[useStoreGeneration] Waiting for basicInfo', {
                hasBasicInfo: !!basicInfo,
                hasBrandName: !!basicInfo?.brandName,
                hasDescription: !!basicInfo?.description,
                generating,
                hasStoreData: !!storeData,
            });
        }
    }, [autoGenerate, basicInfo, storeData, generating, generateStore]);

    const updateStoreData = (updates: any) => {
        setStoreData((prev: any) => {
            if (!prev) return prev;
            return { ...prev, ...updates };
        });
    };

    const updateField = (field: string, value: any) => {
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

    return {
        storeData,
        generating,
        error,
        generateStore,
        updateStoreData,
        updateField,
    };
}

