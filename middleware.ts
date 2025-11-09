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

    // Redirect /en/* to /* (hide default locale)
    if (pathname.startsWith('/en/') || pathname === '/en') {
        const url = request.nextUrl.clone();
        url.pathname = pathname.replace(/^\/en/, '') || '/';
        const response = NextResponse.redirect(url);
        response.cookies.delete('NEXT_LOCALE');
        return response;
    }

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

    // Optional: main domains do normal intl behavior
    const mainDomains = ['www', 'app', 'admin', 'localhost'];
    if (subdomain && mainDomains.includes(subdomain)) {
        return intlMiddleware(request);
    }

    // --- Custom subdomain handling ---
    // Only adjust locale, do NOT add subdomain to path (prevents 404s)
    const localeMatch = pathname.match(/^\/(fr|ar)/);
    const localeFromPath = localeMatch ? localeMatch[1] : null;
    const localeFromCookie = request.cookies.get('NEXT_LOCALE')?.value;
    const locale = localeFromPath || localeFromCookie || 'en';

    const pathWithoutLocale = pathname.replace(/^\/(fr|ar)/, '') || '/';
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathWithoutLocale}`;

    const response = NextResponse.rewrite(url);
    if (locale !== 'en') {
        response.cookies.set('NEXT_LOCALE', locale, {
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
        });
    }

    return response;
}

// --- Config: run for all non-api/static files ---
export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
