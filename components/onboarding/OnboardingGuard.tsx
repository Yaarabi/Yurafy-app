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

    // Check if user is on the plan page (for upgrades)
    const isPlanPage = useMemo(() => {
        return pathname?.includes("/onboarding/plan") || pathname?.endsWith("/plan");
    }, [pathname]);

    useEffect(() => {
        // Wait for session to load
        if (status === "loading") return;

        // Only redirect if onboarding is completed AND user is NOT on the plan page
        // Allow access to plan page even if onboarding is completed (for upgrades)
        if (onboardingCompleted && !isPlanPage && session?.user) {
            router.replace(`/${locale}/dashboard`);
        }
    }, [onboardingCompleted, isPlanPage, locale, router, session, status]);

    // If redirecting, don't render children
    if (onboardingCompleted && !isPlanPage) {
        return null;
    }

    return <>{children}</>;
}

