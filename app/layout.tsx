import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import Providers from '@/components/home/provider';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://yurafy.com';

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: 'Yurafy – AI Tools for COD Sellers & WhatsApp Automation',
    description:
        'Yurafy helps COD sellers build fast online stores, automate WhatsApp messaging, manage teams, and integrate with Moroccan delivery companies using AI-driven tools.',
    keywords:
        'COD Morocco, WhatsApp automation, e-commerce Morocco, delivery integration, AI agent, COD platform, AI business tools',

    icons: '/favi.png',

    openGraph: {
        type: 'website',
        url: baseUrl,
        siteName: 'Yurafy',
        title: 'Yurafy – AI Tools for COD Sellers & WhatsApp Automation',
        description:
        'Create online stores, automate WhatsApp, connect to Moroccan delivery companies, and scale your COD business with AI.',
        images: [
        {
            url: `${baseUrl}/og-image.png`,
            width: 1200,
            height: 630,
            alt: 'Yurafy Platform',
        },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Yurafy – AI Tools for COD Sellers',
        description:
        'Build stores, automate WhatsApp, and scale your COD business with AI.',
        images: [`${baseUrl}/og-image.png`],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
        },
    },

    alternates: {
        canonical: baseUrl,
    },

    other: {
        /** Website Schema */
        'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Yurafy',
        url: baseUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?query={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
        }),

        /** Organization Schema */
        'application/ld+json-organization': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Yurafy',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        sameAs: [
            'https://facebook.com/yurafy',
            'https://instagram.com/yurafy',
        ],
        }),
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <Providers>{children}</Providers>
            <Toaster />
        </body>
        </html>
    );
}
