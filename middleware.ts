import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// --- Extract subdomain from hostname ---
function getSubdomain(hostname: string): string | null {
    const host = hostname.split(':')[0]; // remove port if present

    // Localhost: subdomain.localhost
    if (host.includes('localhost')) {
        const parts = host.split('.');
        if (parts.length > 1 && parts[0] !== 'localhost') {
            return parts[0];
        }
        return null;
    }

    // Production: subdomain.domain.com
    const parts = host.split('.');
    if (parts.length >= 3) {
        return parts[0];
    }

    return null;
}

// --- Internationalization middleware ---
const intlMiddleware = createMiddleware({
    locales: ['en', 'fr', 'ar'],
    defaultLocale: 'en',
    localePrefix: 'as-needed', // Hide default locale (en) from URLs
    localeDetection: true, // Allow locale detection from cookies/headers
});

// --- Main middleware handler ---
export default function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const subdomain = getSubdomain(hostname);
    const pathname = request.nextUrl.pathname;

    // Redirect /en/* to /* (hide default locale)
    if (pathname.startsWith('/en/') || pathname === '/en') {
        const url = request.nextUrl.clone();
        url.pathname = pathname.replace(/^\/en/, '') || '/';
        // Clear locale cookie when redirecting to default locale
        const response = NextResponse.redirect(url);
        response.cookies.delete('NEXT_LOCALE');
        return response;
    }

    // Skip protected or internal routes
    if (
        subdomain &&
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/_next') &&
        !pathname.startsWith('/admin') &&
        !pathname.startsWith('/dashboard') &&
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/signup') &&
        !pathname.startsWith('/onboarding')
    ) {
        const mainDomains = ['www', 'app', 'admin', 'localhost'];
        if (mainDomains.includes(subdomain)) {
            // Main app → normal intl behavior
            return intlMiddleware(request);
        }

        // --- Store subdomain handling ---
        const url = request.nextUrl.clone();

        // Detect locale from path or cookie, default to 'en'
        const localeMatch = pathname.match(/^\/(fr|ar)/);
        const localeFromPath = localeMatch ? localeMatch[1] : null;
        const localeFromCookie = request.cookies.get('NEXT_LOCALE')?.value;
        const locale = localeFromPath || localeFromCookie || 'en';

        // Remove locale prefix from path (only fr/ar, not en)
        const pathWithoutLocale = pathname.replace(/^\/(fr|ar)/, '') || '/';

        // Determine destination path
        if (pathname === '/' || pathname.match(/^\/(fr|ar)\/?$/)) {
            url.pathname = `/${locale}/${subdomain}`;
        } else if (pathWithoutLocale.startsWith('/shop/')) {
            url.pathname = `/${locale}/${subdomain}${pathWithoutLocale}`;
        } else {
            url.pathname = `/${locale}/${subdomain}${pathWithoutLocale}`;
        }

        // Set locale cookie for consistency
        const response = NextResponse.rewrite(url);
        if (locale !== 'en') {
            response.cookies.set('NEXT_LOCALE', locale, {
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 365, // 1 year
            });
        }
        return response;
    }

    // Fallback to intl middleware
    return intlMiddleware(request);
}

// --- Config ---
export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
