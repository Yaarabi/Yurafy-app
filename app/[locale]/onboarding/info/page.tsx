"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ThemeSelector from "@/components/onboarding/ThemeSelector";
import ProductPageStructureSelector from "@/components/onboarding/ProductPageStructureSelector";
import StoreBasicInfoForm from "@/components/onboarding/StoreBasicInfoForm";
import StoreGenerator from "@/components/onboarding/StoreGenerator";

export default function InfoPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const { data: session, status } = useSession();
    const plan = useMemo(() => searchParams.get("plan"), [searchParams]);
    const [selectedTheme, setSelectedTheme] = useState<{
        themeId: number;
        theme: { primaryColor: string; secondaryColor?: string; textColor?: string };
    } | null>(null);
    const [selectedProductPageStructure, setSelectedProductPageStructure] = useState<{
        productDetails: boolean;
        productImages: boolean;
        productDescription: boolean;
        productPrice: boolean;
        productVariants: boolean;
        orderForm: boolean;
        relatedProducts: boolean;
        reviews: boolean;
    } | null>(null);
    const [showProductPageStructure, setShowProductPageStructure] = useState(false);
    const [showBasicInfoForm, setShowBasicInfoForm] = useState(false);
    const [basicInfo, setBasicInfo] = useState<{
        brandName: string;
        domain: string;
        description: string;
        logo?: string;
    } | null>(null);
    const [showGenerator, setShowGenerator] = useState(false);
    const [checking, setChecking] = useState(true);

    // Check if store exists and user onboarding status
    useEffect(() => {
        const checkStoreAndRedirect = async () => {
            if (status === "loading") return;
            
            if (status === "unauthenticated") {
                // ✅ FIX: Normalize locale - extract first segment only
                const localeRaw = String(params.locale || 'en');
                const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';
                router.push(`/${locale}/login`);
                return;
            }

            if (status === "authenticated" && session?.user?.id) {
                try {
                    // Check store existence
                    const storeResponse = await fetch('/api/store/owner', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    });

                    // Check user onboarding status
                    const userResponse = await fetch('/api/auth/refresh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: session.user.id }),
                    });

                    const storeData = await storeResponse.json();
                    const userData = await userResponse.json();

                    // If store exists and onboarding is not completed (first-time flow)
                    if (storeResponse.ok && storeData._id && userData.onboardingCompleted === false) {
                        // ✅ FIX: Normalize locale - extract first segment only
                        const localeRaw = String(params.locale || 'en');
                        const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';
                        // If free plan, redirect to dashboard (onboarding should be completed)
                        if (plan === 'free') {
                            router.push(`/${locale}/dashboard`);
                            return;
                        }
                        // For paid plans, redirect to checkout
                        router.push(`/${locale}/onboarding/checkout?plan=${plan || 'starter'}`);
                        return;
                    }
                    
                    // If store exists and onboarding IS completed, this is an upgrade
                    // Allow user to continue with info page flow for upgrade
                    if (storeResponse.ok && storeData._id && userData.onboardingCompleted === true) {
                        // User is upgrading/changing plan, allow them to continue
                        setChecking(false);
                        return;
                    }
                } catch (error) {
                    console.error('Error checking store and user status:', error);
                    // Continue with normal flow if check fails
                }
            }
            
            setChecking(false);
        };

        checkStoreAndRedirect();
    }, [status, session, router, params.locale, plan]);

    const handleThemeSelect = (themeId: number, theme: { primaryColor: string; secondaryColor?: string; textColor?: string }) => {
        setSelectedTheme({ themeId, theme });
        // Small delay for smooth transition, then go directly to product page structure
        setTimeout(() => {
            setShowProductPageStructure(true);
        }, 300);
    };

    const handleProductPageStructureSelect = (productPageStructure: {
        productDetails: boolean;
        productImages: boolean;
        productDescription: boolean;
        productPrice: boolean;
        productVariants: boolean;
        orderForm: boolean;
        relatedProducts: boolean;
        reviews: boolean;
    }) => {
        setSelectedProductPageStructure(productPageStructure);
        // Small delay for smooth transition
        setTimeout(() => {
            setShowBasicInfoForm(true);
        }, 300);
    };

    const handleBasicInfoSubmit = async (info: { brandName: string; domain: string; description: string; logo?: string }) => {
        // Save logo to both user and store if provided
        if (info.logo && session?.user?.id) {
            try {
                // Save to user model
                const userResponse = await fetch('/api/user/me', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ logo: info.logo }),
                });
                if (!userResponse.ok) {
                    console.error('Failed to save logo to user info');
                }

                // Save to store model if store exists
                try {
                    const storeResponse = await fetch('/api/store/owner', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    
                    if (storeResponse.ok) {
                        const storeData = await storeResponse.json();
                        if (storeData._id) {
                            // Store exists, update it with logoUrl
                            const updateResponse = await fetch('/api/store/owner', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ updates: { logoUrl: info.logo } }),
                            });
                            if (!updateResponse.ok) {
                                console.error('Failed to save logo to store');
                            }
                        }
                    }
                } catch (storeError) {
                    // Store might not exist yet (will be created during store generation)
                    // This is okay, logo will be saved when store is created
                    console.log('Store does not exist yet, will be saved during store creation');
                }
            } catch (error) {
                console.error('Error saving logo:', error);
            }
        }
        
        setBasicInfo(info);
        // Small delay for smooth transition
        setTimeout(() => {
            setShowGenerator(true);
        }, 300);
    };

    const handleBackFromGenerator = () => {
        setShowGenerator(false);
        setBasicInfo(null);
        setShowBasicInfoForm(true);
    };

    const handleBackFromBasicInfo = () => {
        setShowBasicInfoForm(false);
        setSelectedProductPageStructure(null);
    };

    // Show loading state while checking
    if (checking || status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking your store status...</p>
                </div>
            </div>
        );
    }

    // Show theme selector first
    if (!selectedTheme || !showProductPageStructure) {
        return <ThemeSelector onThemeSelect={handleThemeSelect} />;
    }

    // Show product page structure selector after theme is selected
    if (!showBasicInfoForm || !selectedProductPageStructure) {
        return (
            <ProductPageStructureSelector
                onSelect={handleProductPageStructureSelect}
                selectedTheme={selectedTheme}
            />
        );
    }

    // Show basic info form after product page structure is selected
    if (!showGenerator || !basicInfo) {
        return (
            <StoreBasicInfoForm
                selectedTheme={selectedTheme}
                onSubmit={handleBasicInfoSubmit}
                onBack={handleBackFromBasicInfo}
            />
        );
    }

    // Show generator with preview after basic info is submitted
    // Default themeStructure with all sections enabled
    const defaultThemeStructure = {
        header: true,
        hero: true,
        about: true,
        trust: true,
        productGrid: true,
        footer: true,
    };

    return (
        <StoreGenerator
            selectedTheme={selectedTheme}
            selectedThemeStructure={defaultThemeStructure}
            selectedProductPageStructure={selectedProductPageStructure}
            basicInfo={basicInfo}
            plan={plan || "Starter"}
            onBack={handleBackFromGenerator}
        />
    );
}
