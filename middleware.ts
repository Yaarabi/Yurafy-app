import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { extractSubdomain, isStoreSubdomain } from '@/lib/utils/storeRouting';

const MAIN_DOMAINS = ['www', 'app', 'admin', 'localhost'];
const PROTECTED_ROUTES = ['/api', '/_next', '/admin', '/dashboard', '/login', '/signup', '/onboarding', '/verify-email', '/forgot-password', '/reset-password'];

// Internationalization middleware for main app
const intlMiddleware = createMiddleware({
    locales: ['en', 'fr', 'ar'],
    defaultLocale: 'en',
    localePrefix: 'as-needed',
    localeDetection: true,
});

/**
 * Check if path is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

// We no longer strip /en for default locale on store routes to preserve nested /{locale}/{domain}
function shouldSkipIntl(pathname: string) {
    // Store paths have shape /{locale}/{domain}[...]
    // We always run intl middleware except when handling a subdomain rewrite.
    return false;
}

/**
 * Main middleware function
 */
export default function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const pathname = request.nextUrl.pathname;

    // Protected routes: still run intl
    if (isProtectedRoute(pathname)) {
        return intlMiddleware(request);
    }

    // Subdomain detection for store: rewrite to /en/{domain}[pathname]
    const subdomain = extractSubdomain(hostname, MAIN_DOMAINS);
    const isStoreDomain = isStoreSubdomain(hostname, MAIN_DOMAINS);
    if (isStoreDomain && subdomain) {
        // If already rewritten (starts with /en/{subdomain}) just continue
        if (pathname.startsWith(`/en/${subdomain}`)) {
            return intlMiddleware(request);
        }
        const rewrite = request.nextUrl.clone();
        // Preserve trailing path (except root)
        const trailing = pathname === '/' ? '' : pathname;
        rewrite.pathname = `/en/${subdomain}${trailing}`;
        return NextResponse.rewrite(rewrite);
    }

    // Main domain: run intl unless explicitly skipped (we currently never skip)
    if (!shouldSkipIntl(pathname)) {
        return intlMiddleware(request);
    }
    return NextResponse.next();
}

// Config: Run for all non-api/static files
export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
