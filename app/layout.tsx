import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import Providers from '@/components/home/provider';
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://yurait.vercel.app';

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: 'Yurafy - AI-Powered Business Automation Platform',
    description: 'Transform your business with AI-driven automation. Create stunning stores, automate WhatsApp messaging, and scale effortlessly with intelligent solutions.',
    keywords: 'AI automation, business automation, WhatsApp automation, e-commerce, custom web development, AI agent, business tools',
    authors: [{ name: 'Yurafy Team' }],
    creator: 'Yurafy',
    publisher: 'Yurafy',
    icons: '/favi.png',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: baseUrl,
        siteName: 'Yurafy',
        title: 'Yurafy - AI-Powered Business Automation Platform',
        description: 'Transform your business with AI-driven automation. Create stunning stores, automate WhatsApp messaging, and scale effortlessly.',
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
        title: 'Yurafy - AI-Powered Business Automation Platform',
        description: 'Transform your business with AI-driven automation.',
        images: [`${baseUrl}/og-image.png`],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <Providers>{children}</Providers> 
            <Toaster/>
        </body>
        </html>
    );
}
