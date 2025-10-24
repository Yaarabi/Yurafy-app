import { ReactNode } from "react";
import { notFound } from "next/navigation";
import ProtectedDashboardClient from "@/components/dashboard/dashboardLayout";
import ThemeProvider from "@/components/dashboard/theme";

async function getMessages(locale: string) {
    try {
        return (await import(`@/messages/${locale}.json`)).default;
    } catch {
        return (await import(`@/messages/en.json`)).default;
    }
}

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

    const messages = await getMessages(locale);

    return (
        <ThemeProvider>
        <ProtectedDashboardClient locale={locale} messages={messages}>
            {children}
        </ProtectedDashboardClient>
        </ThemeProvider>
    );
}
