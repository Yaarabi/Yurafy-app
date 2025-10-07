import { ReactNode } from "react";
import { notFound } from "next/navigation";
import ProtectedDashboardClient from "@/components/dashboard/dashboardLayout";



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
    params: { locale: string };
    }) {
    const { locale } = await params;
    const supportedLocales = ["en", "fr", "ar"];

    if (!supportedLocales.includes(locale)) notFound();

    const messages = await getMessages(locale);

    return (
        <ProtectedDashboardClient locale={locale} messages={messages}>
        {children}
        </ProtectedDashboardClient>
    );
}
