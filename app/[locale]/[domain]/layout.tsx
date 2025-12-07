import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { headers } from 'next/headers';
import Script from 'next/script';
import { loadMessages } from '@/lib/utils/loadMessages';

export default async function Layout({
    children,
    params
    }: {
    children: ReactNode;
    params: Promise<{ locale: string; domain: string }>; // ✅ keep Promise
    }) {
    const { locale, domain } = await params;
    const supportedLocales = ['en', 'fr', 'ar'];

    if (!supportedLocales.includes(locale)) {
        notFound();
    }

    const messages = await loadMessages(locale);

    // ✅ headers() is synchronous, no await
    const headersList = await headers();
    const subdomainFromHeader = headersList.get('x-subdomain');


    // Build store URL for canonical + structured data
    const domainPart = process.env.NEXT_PUBLIC_DOMAIN || 'yurafy.com';
    const storeUrl = subdomainFromHeader
        ? `https://${subdomainFromHeader}.${domainPart}`
        : `https://${domainPart}/${locale}/${domain}`;

    const currentYear = new Date().getFullYear();

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: domain,
        url: storeUrl,
        description: `Shop ${domain} on Yurafy – AI-powered COD & WhatsApp automation.`,
        image: `${storeUrl}/logo.png`,
        sameAs: [
            `https://facebook.com/${domain}`,
            `https://instagram.com/${domain}`
        ]
    };

    return (
        <html lang={locale}>
        <head>
            {/* Canonical URL */}
            <link rel="canonical" href={storeUrl} />

            {/* Structured Data for Store */}
            <Script
                id="store-ld-json"
                type="application/ld+json"
                strategy="beforeInteractive"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
        </head>
        <body>
            <NextIntlClientProvider locale={locale} messages={messages}>
            <main className="min-h-screen">{children}</main>
            </NextIntlClientProvider>
        </body>
        </html>
    );
}
