"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import Providers from "@/components/login/Providers";
import Sidebar from "./sidebar/Sidebar";
import LogoLoader from "../themePreview/loadder";

interface Props {
    children: ReactNode;
    locale: string;
    messages: any;
}

export default function ProtectedDashboardClient({
    children,
    locale,
    messages,
    }: Props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/${locale}/login`);
            return;
        }

        if (status === "authenticated" && session?.user?.id) {
            fetch("/api/auth/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: session.user.id }),
            })
                .then(async (res) => {
                    if (!res.ok) throw new Error("Unauthorized");
                    const data = await res.json();
                    const completed = data.onboardingCompleted ?? false;

                    // Case 1: First-time users (onboarding not completed)
                    // Redirect to onboarding flow
                    if (!completed) {
                        router.push(`/${locale}/onboarding/plan`);
                        return;
                    }

                    // Case 2: User has completed onboarding
                    // Allow dashboard access
                    setOnboardingCompleted(completed);
                })
                .catch(() => {
                    // If check fails, redirect to onboarding (first-time flow)
                    router.push(`/${locale}/onboarding/plan`);
                });
        }
    }, [status, session, router, locale]);

    if (status === "loading" || onboardingCompleted === null) return <LogoLoader />;

    // Dashboard pages require completed onboarding
    // Note: Onboarding pages use a different layout (onboarding/layout.tsx) with OnboardingGuard
    // This component only handles dashboard routes
    if (status === "authenticated" && onboardingCompleted === true) {
        return (
            <Providers session={session}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] dark:bg-[var(--color-bg)] dark:text-[var(--color-text)] flex flex-col md:flex-row">
                        <div className="md:w-64 md:fixed md:inset-y-0 md:left-0 z-40">
                            <Sidebar />
                        </div>
                        <div className="flex-1 md:ml-64 overflow-y-auto min-h-screen p-4">
                            <main className="flex-1">{children}</main>
                        </div>
                    </div>
                </NextIntlClientProvider>
            </Providers>
        );
    }

    return null;
}
