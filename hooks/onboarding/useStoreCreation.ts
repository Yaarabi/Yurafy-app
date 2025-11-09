import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface StoreCreationData {
    brandName: string;
    domain: string;
    description: string;
    language?: string;
    themeId: number;
    theme: {
        primaryColor: string;
        secondaryColor?: string;
        textColor?: string;
    };
    themeStructure?: {
        header: boolean;
        hero: boolean;
        about: boolean;
        trust: boolean;
        productGrid: boolean;
        footer: boolean;
    };
    hero: {
        title: string;
        subtitle: string;
        imageUrl: string;
    };
    about: {
        title: string;
        description: string;
    };
    footer?: {
        text?: string;
    };
    socialLinks?: Record<string, string>;
    headerLinks?: Array<{ label: string; href: string }>;
    whatsappNumber?: string;
    logoUrl?: string;
}

interface UseStoreCreationOptions {
    plan?: string;
    locale?: string;
    onSuccess?: (storeData: any) => void;
    onError?: (error: string) => void;
}

export function useStoreCreation(options: UseStoreCreationOptions = {}) {
    const { plan, locale = 'en', onSuccess, onError } = options;
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createStore = async (data: StoreCreationData) => {
        setCreating(true);
        setError(null);

        try {
            // Normalize domain
            const normalizedDomain = data.domain
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            // Prepare store payload
            const storePayload = {
                brandName: data.brandName,
                language: data.language || 'en',
                domain: normalizedDomain,
                description: data.description,
                themeId: data.themeId,
                theme: {
                    primaryColor: data.theme.primaryColor,
                    secondaryColor: data.theme.secondaryColor,
                    textColor: data.theme.textColor,
                },
                themeStructure: data.themeStructure || {
                    header: true,
                    hero: true,
                    about: true,
                    trust: true,
                    productGrid: true,
                    footer: true,
                },
                hero: {
                    title: data.hero.title,
                    subtitle: data.hero.subtitle,
                    imageUrl: data.hero.imageUrl,
                },
                about: {
                    title: data.about.title,
                    description: data.about.description,
                },
            footer: {
                text: data.footer?.text || `© ${new Date().getFullYear()} ${data.brandName}. All rights reserved.`,
            },
            socialLinks: data.socialLinks || {},
            headerLinks: data.headerLinks || [],
            whatsappNumber: data.whatsappNumber,
            logoUrl: data.logoUrl,
        };

            // Send to store API
            const response = await fetch('/api/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storePayload),
            });

            const responseData = await response.json();

            if (!response.ok) {
                let errorMessage = responseData.error || 'Failed to create store';
                
                // Handle specific error cases
                if (response.status === 400 && responseData.error?.includes('Domain already exists')) {
                    errorMessage = 'A store with this domain already exists. Please choose a different domain.';
                }
                
                setError(errorMessage);
                toast.error(errorMessage);
                onError?.(errorMessage);
                return { success: false, error: errorMessage };
            }

            if (responseData.store) {
                toast.success('Store created successfully!');
                onSuccess?.(responseData.store);
                
                // Redirect based on plan
                if (plan === 'free') {
                    setTimeout(() => {
                        router.push(`/${locale}/dashboard`);
                    }, 500);
                } else {
                    setTimeout(() => {
                        router.push(`/${locale}/onboarding/checkout?plan=${plan || 'starter'}`);
                    }, 500);
                }
                
                return { success: true, store: responseData.store };
            } else {
                const errorMessage = 'Store creation succeeded but no store data was returned';
                setError(errorMessage);
                toast.error(errorMessage);
                onError?.(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error: any) {
            console.error('Error creating store:', error);
            const errorMessage = error.message || 'Something went wrong while creating the store. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
            onError?.(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setCreating(false);
        }
    };

    return {
        createStore,
        creating,
        error,
    };
}

