import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://yurait.vercel.app';
    
    return {
        rules: [
        {
            userAgent: '*',
            allow: [
                '/', // Homepage
                '/en/', // Locale pages
                '/fr/',
                '/ar/',
                '/shop/', // Product pages  
            ],
            disallow: [
                '/api/', // All API routes (protected)
                '/dashboard/', // User dashboard (auth required)
                '/admin/', // Admin panel (admin only)
                '/_next/', // Next.js internal
                '/onboarding/', // Onboarding flow (auth required)
                '/login', // Auth pages
                '/signup',
                '/verify-email',
                '/forgot-password',
                '/reset-password',
            ],
        },
        {
            userAgent: 'Googlebot',
            allow: [
                '/',
                '/en/',
                '/fr/',
                '/ar/',
                '/shop/',
            ],
            disallow: [
                '/api/',
                '/dashboard/',
                '/admin/',
                '/onboarding/',
                '/login',
                '/signup',
                '/verify-email',
                '/forgot-password',
                '/reset-password',
            ],
            crawlDelay: 1, // Respectful crawling
        },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
