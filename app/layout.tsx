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
        'Yurafy helps COD sellers build fast online stores, automate WhatsApp messaging.',
    keywords:
        'COD Morocco, WhatsApp automation, e-commerce Morocco, delivery integration, AI agent, COD platform, AI business tools, Yurafy',

    icons: '/favi.png',

    openGraph: {
        type: 'website',
        url: baseUrl,
        siteName: 'Yurafy',
        title: 'Yurafy – AI Tools for COD Sellers & WhatsApp Automation',
        description:
            'Create online stores, automate WhatsApp, and scale your COD business with AI.',
        images: [
            {
                url: `${baseUrl}/yurafy.svg`,
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
        images: [`${baseUrl}/yurafy.svg`],
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

        /** Pages Schema */
        'application/ld+json-pages': JSON.stringify([
            {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: 'Home',
                url: `${baseUrl}/`,
                description:
                    'Welcome to Yurafy – build AI-powered stores with WhatsApp automation and COD support.',
            },
            {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: 'Services',
                url: `${baseUrl}/services`,
                description:
                    'Discover Yurafy’s automation tools for COD sellers, including WhatsApp bots, AI agents, and storefront setup.',
            },
            {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: 'Blog',
                url: `${baseUrl}/blog`,
                description:
                    'Insights and updates on e-commerce, AI automation, and WhatsApp-native business strategies.',
            },
            {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: 'Login',
                url: `${baseUrl}/login`,
                description:
                    'Access your Yurafy dashboard to manage your store, orders, and automation tools.',
            },
            {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: 'Signup',
                url: `${baseUrl}/signup`,
                description:
                    'Create your Yurafy account and launch your AI-powered COD store in minutes.',
            },
            {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: 'Contact',
                url: `${baseUrl}/contact`,
                description:
                    'Get in touch with Yurafy for support, partnerships, or custom development services.',
            },
        ]),
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
