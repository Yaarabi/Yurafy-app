

import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import PlanProtection from '@/components/dashboard/PlanProtection';
import { loadMessages } from '@/lib/utils/loadMessages';

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

    const messages = await loadMessages(locale);

    return (
            <NextIntlClientProvider locale={locale} messages={messages}>
                    <main className='min-h-screen'>
                        <PlanProtection requiredFeature="store.enabled" planName="Store Plans">
                            {children}
                        </PlanProtection>
                    </main>
            </NextIntlClientProvider>
    );
}



