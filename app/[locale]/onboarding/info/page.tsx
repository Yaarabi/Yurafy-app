"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useStoreStatus } from "@/hooks/onboarding/useStoreStatus";
import ThemeSelector from "@/components/onboarding/ThemeSelector";
import StoreBasicInfoForm from "@/components/onboarding/StoreBasicInfoForm";
import StoreGenerator from "@/components/onboarding/StoreGenerator";

export default function InfoPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const { data: session, status: sessionStatus } = useSession();
    const plan = useMemo(() => searchParams.get("plan"), [searchParams]);
    const storeStatus = useStoreStatus();
    
    const [selectedTheme, setSelectedTheme] = useState<{
        themeId: number;
        theme: { primaryColor: string; secondaryColor?: string; textColor?: string; surfaceColor?: string };
    } | null>(null);
    const [showBasicInfoForm, setShowBasicInfoForm] = useState(false);
    const [basicInfo, setBasicInfo] = useState<{
        brandName: string;
        domain: string;
        description: string;
        logo?: string;
        language?: string;
    } | null>(null);
    const [showGenerator, setShowGenerator] = useState(false);

    // Handle redirects based on store status
    useEffect(() => {
        if (sessionStatus === 'loading' || storeStatus.isLoading) {
            return;
        }

        if (sessionStatus === 'unauthenticated') {
            const localeRaw = String(params.locale || 'en');
            const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';
            router.push(`/${locale}/login`);
            return;
        }

        // If store exists and onboarding is not completed (first-time flow)
        if (storeStatus.hasStore && !storeStatus.onboardingCompleted) {
            const localeRaw = String(params.locale || 'en');
            const locale = localeRaw.split('/').filter(Boolean)[0] || 'en';
            // If free plan, redirect to dashboard
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
    }, [sessionStatus, storeStatus, router, params.locale, plan]);

    const handleThemeSelect = (themeId: number, theme: { primaryColor: string; secondaryColor?: string; textColor?: string; surfaceColor?: string }) => {
        setSelectedTheme({ themeId, theme });
        // ✅ FIXED: Redirect directly to form after theme selection
        setTimeout(() => {
            setShowBasicInfoForm(true);
        }, 300);
    };

    const handleBasicInfoSubmit = async (info: { brandName: string; domain: string; description: string; logo?: string; language?: string }) => {
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
        setSelectedTheme(null);
    };

    // Show loading state while checking
    if (sessionStatus === "loading" || storeStatus.isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking your store status...</p>
                </div>
            </div>
        );
    }

    // ✅ FIXED: Show theme selector first, then redirect directly to form
    if (!selectedTheme || !showBasicInfoForm) {
        return <ThemeSelector onThemeSelect={handleThemeSelect} />;
    }

    // ✅ FIXED: Show basic info form after theme is selected
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

    // ✅ FIXED: Product page structure removed - no longer needed
    return (
        <StoreGenerator
            selectedTheme={selectedTheme}
            selectedThemeStructure={defaultThemeStructure}
            basicInfo={basicInfo}
            plan={plan || "Starter"}
            onBack={handleBackFromGenerator}
        />
    );
}
