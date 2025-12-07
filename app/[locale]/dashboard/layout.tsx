import { ReactNode } from "react";
import { notFound } from "next/navigation";
import ProtectedDashboardClient from "@/components/dashboard/dashboardLayout";
import ThemeProvider from "@/components/dashboard/theme";
import { loadMessages } from "@/lib/utils/loadMessages";

export default async function DashboardLayoutServer({
    children,
    params,
    }: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
    }) {
    const { locale } = await params;
    const supportedLocales = ["en", "fr", "ar"];

    if (!supportedLocales.includes(locale)) notFound();

    const messages = await loadMessages(locale);

    return (
        <ThemeProvider>
        <ProtectedDashboardClient locale={locale} messages={messages}>
            {children}
        </ProtectedDashboardClient>
        </ThemeProvider>
    );
}
