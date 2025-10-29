"use client";

import { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import Providers from "@/components/home/provider";
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

    useEffect(() => {
        if (status === "unauthenticated") router.push(`/${locale}/login`);
        if (status === "authenticated" && session?.user?.plan === null) {
            router.push(`/${locale}/onboarding/plan`);
        };
    }, [status, session, router, locale]);

    if (status === "loading") return <LogoLoader/>

    if (status === "authenticated" && session?.user?.plan !== null) {
        return (
        <Providers session={session}>
            <NextIntlClientProvider locale={locale} messages={messages}>
            <div
                className="
                min-h-screen
                bg-[var(--color-bg)] text-[var(--color-text)]
                dark:bg-[var(--color-bg)] dark:text-[var(--color-text)]
                flex flex-col md:flex-row
                "
            >
                {/* 📱 Sidebar */}
                <div className="md:w-64 md:fixed md:inset-y-0 md:left-0 z-40">
                <Sidebar />
                </div>

                {/* 🧭 Main content area */}
                <div
                className="
                    flex-1 
                    md:ml-64 
                    overflow-y-auto
                    min-h-screen
                    p-4
                "
                >
                <main className="flex-1">{children}</main>
                </div>
            </div>
            </NextIntlClientProvider>
        </Providers>
        );
    }

    return null;
}
