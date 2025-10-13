"use client";

import { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import Providers from "@/components/home/provider";
import Sidebar from "./sidebar/Sidebar";

interface Props {
    children: ReactNode;
    locale: string;
    messages: any;
}

export default function ProtectedDashboardClient({ children, locale, messages }: Props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") router.push(`/${locale}/login`);
        // router.push(`/${locale}/shop`);
    }, [status, session, router]);

    if (status === "loading") return <h2>Loading...</h2>;

    if (status === "authenticated") {
        return (
        <Providers session={session}>
            <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="flex flex-col md:grid md:grid-cols-[auto_1fr] min-h-screen bg-gray-800">
                <Sidebar />
                <div className="flex flex-col flex-1">
                <main className="p-4 flex-1">{children}</main>
                </div>
            </div>
            </NextIntlClientProvider>
        </Providers>
        );
    }

    return null;
}
