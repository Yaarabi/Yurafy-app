
import Sidebar from '@/components/dashboard/sideBar';
import Header from '@/components/dashboard/header';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

async function getMessages(locale: string) {
    try {
        return (await import(`@/messages/${locale}.json`)).default;
    } catch {
        return (await import(`@/messages/en.json`)).default;
    }
}

export default async function Layout({
    children,
    params
    }: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
    }) {
    const { locale } = await params;
    const supportedLocales = ['en', 'fr', 'ar'];

    if (!supportedLocales.includes(locale)) {
        notFound();
    }

    const messages = await getMessages(locale);

    return (
            <NextIntlClientProvider locale={locale} messages={messages}>
                <div className="grid grid-cols-[16rem_1fr] min-h-screen">
                    <Sidebar />
                    <div className="flex flex-col">
                        <Header />
                        <main className="p-4">{children}</main>
                    </div>
                </div>
            </NextIntlClientProvider>
    );
}



