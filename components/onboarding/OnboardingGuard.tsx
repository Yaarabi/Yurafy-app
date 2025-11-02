"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";

interface OnboardingGuardProps {
    children: React.ReactNode;
    locale: string;
    onboardingCompleted: boolean;
}

export default function OnboardingGuard({ 
    children, 
    locale, 
    onboardingCompleted 
}: OnboardingGuardProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    // Check if user is on pages that should be accessible during upgrades
    // Allow access to plan, info, and checkout pages for upgrades
    const isUpgradePage = useMemo(() => {
        const path = pathname || '';
        return path.includes("/onboarding/plan") || 
               path.includes("/onboarding/info") || 
               path.includes("/onboarding/checkout") ||
               path.endsWith("/plan") ||
               path.endsWith("/info") ||
               path.endsWith("/checkout");
    }, [pathname]);

    useEffect(() => {
        // Wait for session to load
        if (status === "loading") return;

        // Only redirect if onboarding is completed AND user is NOT on upgrade-related pages
        // Allow access to plan, info, and checkout pages even if onboarding is completed (for upgrades)
        if (onboardingCompleted && !isUpgradePage && session?.user) {
            router.replace(`/${locale}/dashboard`);
        }
    }, [onboardingCompleted, isUpgradePage, locale, router, session, status]);

    // If redirecting, don't render children
    if (onboardingCompleted && !isUpgradePage) {
        return null;
    }

    return <>{children}</>;
}

