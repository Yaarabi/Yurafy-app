"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AIStoreSetup from "@/components/onboarding/ai/AIStoreSetup";
import ThemeSelector from "@/components/onboarding/ThemeSelector";
import StoreThemeStructureSelector from "@/components/onboarding/StoreThemeStructureSelector";
import ProductPageStructureSelector from "@/components/onboarding/ProductPageStructureSelector";

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
    const [selectedThemeStructure, setSelectedThemeStructure] = useState<{
        header: boolean;
        hero: boolean;
        about: boolean;
        trust: boolean;
        productGrid: boolean;
        footer: boolean;
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
    const [showThemeStructure, setShowThemeStructure] = useState(false);
    const [showProductPageStructure, setShowProductPageStructure] = useState(false);
    const [showAgent, setShowAgent] = useState(false);
    const [checking, setChecking] = useState(true);

    // Check if store exists and user onboarding status
    useEffect(() => {
        const checkStoreAndRedirect = async () => {
            if (status === "loading") return;
            
            if (status === "unauthenticated") {
                router.push(`/${params.locale}/login`);
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

                    // If store exists and onboarding is not completed, redirect to checkout
                    if (storeResponse.ok && storeData._id && userData.onboardingCompleted === false) {
                        router.push(`/${params.locale}/onboarding/checkout?plan=${plan || 'starter'}`);
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
        // Small delay for smooth transition
        setTimeout(() => {
            setShowThemeStructure(true);
        }, 300);
    };

    const handleThemeStructureSelect = (themeStructure: {
        header: boolean;
        hero: boolean;
        about: boolean;
        trust: boolean;
        productGrid: boolean;
        footer: boolean;
    }) => {
        setSelectedThemeStructure(themeStructure);
        // Small delay for smooth transition
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
            setShowAgent(true);
        }, 300);
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
    if (!selectedTheme || !showThemeStructure) {
        return <ThemeSelector onThemeSelect={handleThemeSelect} />;
    }

    // Show store theme structure selector after theme is selected
    if (!showProductPageStructure || !selectedThemeStructure) {
        return (
            <StoreThemeStructureSelector
                onSelect={handleThemeStructureSelect}
                selectedTheme={selectedTheme}
            />
        );
    }

    // Show product page structure selector after store structure is selected
    if (!showAgent || !selectedProductPageStructure) {
        return (
            <ProductPageStructureSelector
                onSelect={handleProductPageStructureSelect}
                selectedTheme={selectedTheme}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex justify-center items-start">
            <div className="w-full max-w-6xl">
                <AIStoreSetup
                    plan={plan || "Starter"}
                    selectedTheme={selectedTheme}
                    selectedThemeStructure={selectedThemeStructure}
                    selectedProductPageStructure={selectedProductPageStructure}
                    onComplete={(data) => {
                        // Store creation and redirect handled inside AIStoreSetup component
                        console.log("Store setup completed:", data);
                    }}
                />
            </div>
        </div>
    );
}
