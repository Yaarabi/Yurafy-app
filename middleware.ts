import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getSubdomain } from '@/lib/utils/subdomain';
import { routing } from './i18n/routing';

// --- Internationalization middleware ---
// Disable automatic locale detection to respect user's explicit choice via cookie
const intlMiddleware = createMiddleware({
    ...routing,
    localeDetection: false, // User choice via NEXT_LOCALE cookie takes precedence
});

// --- Main middleware ---
export default function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const subdomain = getSubdomain(hostname, { mainDomains: ['www', 'app', 'admin'] });
    const pathname = request.nextUrl.pathname;

    // Check if user explicitly set locale to 'en' via cookie
    const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
    const isEnglishSelected = localeCookie === 'en';

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
            response.cookies.set('NEXT_LOCALE', 'en', {
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
                sameSite: 'lax',
            });
            return response;
        }
        
        // If user selected English and not on /en path, ensure cookie is set
        if (isEnglishSelected && !pathname.startsWith('/fr') && !pathname.startsWith('/ar')) {
            const response = intlMiddleware(request);
            response.cookies.set('NEXT_LOCALE', 'en', {
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
                sameSite: 'lax',
            });
            return response;
        }
        
        return intlMiddleware(request);
    }

    // If we have a subdomain (store subdomain), let the root page handle it
    // Don't rewrite - just pass through to app/page.tsx
    if (subdomain && !mainDomains.includes(subdomain)) {
        // For store subdomains, don't interfere with routing
        // The root page (app/page.tsx) will handle subdomain detection
        return NextResponse.next();
    }

    // For root domain (no subdomain), handle locale routing
    // Redirect /en/* to /* (hide default locale)
    if (pathname.startsWith('/en/') || pathname === '/en') {
        const url = request.nextUrl.clone();
        url.pathname = pathname.replace(/^\/en/, '') || '/';
        const response = NextResponse.redirect(url);
        response.cookies.set('NEXT_LOCALE', 'en', {
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
            sameSite: 'lax',
        });
        return response;
    }

    // If user selected English and not on a localized path, ensure cookie is set
    if (isEnglishSelected && !pathname.startsWith('/fr') && !pathname.startsWith('/ar')) {
        const response = intlMiddleware(request);
        response.cookies.set('NEXT_LOCALE', 'en', {
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
            sameSite: 'lax',
        });
        return response;
    }

    // Apply intl middleware for root domain
    return intlMiddleware(request);
}

// --- Config: run for all non-api/static files ---
export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
