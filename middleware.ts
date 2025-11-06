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
        return NextResponse.redirect(url);
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

        // Detect locale or default to 'en' (exclude 'en' from matching since it's hidden)
        const localeMatch = pathname.match(/^\/(fr|ar)/);
        const locale = localeMatch ? localeMatch[1] : 'en';

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

        // ✅ Keep rewrite (no redirect flash)
        return NextResponse.rewrite(url);
    }

    // Fallback to intl middleware
    return intlMiddleware(request);
}

// --- Config ---
export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
