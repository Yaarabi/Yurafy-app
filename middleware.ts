import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getSubdomain } from '@/lib/utils/subdomain';

// --- Internationalization middleware ---
const intlMiddleware = createMiddleware({
    locales: ['en', 'fr', 'ar'],
    defaultLocale: 'en',
    localePrefix: 'as-needed',
    localeDetection: true,
});

// --- Main middleware ---
export default function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const subdomain = getSubdomain(hostname, { mainDomains: ['www', 'app', 'admin'] });
    const pathname = request.nextUrl.pathname;

    // Skip internal/protected routes
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/onboarding')
    ) {
        return intlMiddleware(request);
    }

    // Main domains (www, app, admin) - use normal intl behavior
    const mainDomains = ['www', 'app', 'admin'];
    if (subdomain && mainDomains.includes(subdomain)) {
        // Redirect /en/* to /* (hide default locale) for main domains
        if (pathname.startsWith('/en/') || pathname === '/en') {
            const url = request.nextUrl.clone();
            url.pathname = pathname.replace(/^\/en/, '') || '/';
            const response = NextResponse.redirect(url);
            response.cookies.delete('NEXT_LOCALE');
            return response;
        }
        return intlMiddleware(request);
    }

    // If we have a subdomain (store subdomain), handle locale-aware rewrites
    if (subdomain && !mainDomains.includes(subdomain)) {
        const segments = pathname.split('/').filter(Boolean);
        const locales = ['en', 'fr', 'ar'];
        const locale = segments[0];

        if (locale && locales.includes(locale)) {
            const hasDomainInPath = segments[1] === subdomain;

            if (!hasDomainInPath) {
                const restSegments = segments.slice(1);
                const rewrittenSegments = [locale, subdomain, ...restSegments];
                const url = request.nextUrl.clone();
                url.pathname = `/${rewrittenSegments.join('/')}`;

                const response = NextResponse.rewrite(url);
                response.headers.set('x-subdomain', subdomain);
                response.cookies.set('NEXT_LOCALE', locale);
                return response;
            }

            const response = NextResponse.next();
            response.headers.set('x-subdomain', subdomain);
            return response;
        }

        const response = NextResponse.next();
        response.headers.set('x-subdomain', subdomain);
        return response;
    }

    // For root domain (no subdomain), handle locale routing
    // Redirect /en/* to /* (hide default locale)
    if (pathname.startsWith('/en/') || pathname === '/en') {
        const url = request.nextUrl.clone();
        url.pathname = pathname.replace(/^\/en/, '') || '/';
        const response = NextResponse.redirect(url);
        response.cookies.delete('NEXT_LOCALE');
        return response;
    }

    // Apply intl middleware for root domain
    return intlMiddleware(request);
}

// --- Config: run for all non-api/static files ---
export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
