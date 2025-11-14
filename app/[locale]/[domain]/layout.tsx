import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { headers } from 'next/headers';

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
    params: Promise<{ locale: string; domain: string }>; // ✅ keep Promise
    }) {
    const { locale, domain } = await params;
    const supportedLocales = ['en', 'fr', 'ar'];

    if (!supportedLocales.includes(locale)) {
        notFound();
    }

    const messages = await getMessages(locale);

    // ✅ headers() is synchronous, no await
    const headersList = await headers();
    const subdomainFromHeader = headersList.get('x-subdomain');


    // Build store URL for canonical + structured data
    const domainPart = process.env.NEXT_PUBLIC_DOMAIN || 'yurafy.com';
    const storeUrl = subdomainFromHeader
        ? `https://${subdomainFromHeader}.${domainPart}`
        : `https://${domainPart}/${locale}/${domain}`;

    return (
        <html lang={locale}>
        <head>
            {/* Canonical URL */}
            <link rel="canonical" href={storeUrl} />

            {/* Structured Data for Store */}
            <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
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
                })
            }}
            />
        </head>
        <body>
            <NextIntlClientProvider locale={locale} messages={messages}>
            <header>
                {/* Store branding/navigation goes here */}
            </header>
            <main className="min-h-screen">{children}</main>
            <footer>
                <p>© {new Date().getFullYear()} {domain} on Yurafy</p>
            </footer>
            </NextIntlClientProvider>
        </body>
        </html>
    );
}
