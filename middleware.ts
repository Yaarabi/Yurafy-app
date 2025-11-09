import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// --- Subdomain extraction ---
function getSubdomain(hostname: string): string | null {
    const host = hostname.split(':')[0]; 
    if (host.includes('localhost')) {
        const parts = host.split('.');
        return parts.length > 1 && parts[0] !== 'localhost' ? parts[0] : null;
    }
    const parts = host.split('.');
    return parts.length >= 3 ? parts[0] : null;
}

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
    const subdomain = getSubdomain(hostname);
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
