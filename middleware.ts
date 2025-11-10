import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { extractSubdomain, isStoreSubdomain } from '@/lib/utils/storeRouting';

// Base subdomains considered part of the main app (not store subdomains)
const BASE_MAIN_DOMAINS = ['www', 'app', 'admin', 'localhost'];
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

    // Detect if first segment is a supported locale
    const LOCALES = ['en', 'fr', 'ar'];
    const pathSegments = pathname.split('/').filter(Boolean);
    const hasExplicitLocale = pathSegments.length > 0 && LOCALES.includes(pathSegments[0]);
    const explicitLocale = hasExplicitLocale ? pathSegments[0] : null;

    // Resolve primary domain (custom domain or primary vercel domain for the app)
    // Example: NEXT_PUBLIC_DOMAIN=yurafy.com or yurait.vercel.app
    const PRIMARY_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || '';
    const primarySub = PRIMARY_DOMAIN ? PRIMARY_DOMAIN.split('.')[0] : '';
    // Include the primary domain's top-level subdomain (e.g., 'yurait' from 'yurait.vercel.app')
    const MAIN_DOMAINS = primarySub
        ? Array.from(new Set([...BASE_MAIN_DOMAINS, primarySub]))
        : BASE_MAIN_DOMAINS;

    // Protected routes: still run intl
    if (isProtectedRoute(pathname)) {
        return intlMiddleware(request);
    }

    // Determine if current host is under our primary domain (or localhost)
    const hostNoPort = hostname.split(':')[0];
    const isLocalhost = hostNoPort.includes('localhost');
    const isUnderPrimary = PRIMARY_DOMAIN ? hostNoPort.endsWith(PRIMARY_DOMAIN) : isLocalhost;

    // Pick target locale for subdomain rewrite: respect explicit locale in path if present, else cookie, else default
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    const targetLocale = explicitLocale || cookieLocale || 'en';

    // Subdomain detection for store (only on our primary domain or localhost): rewrite to /{locale}/{domain}[trailing]
    const subdomain = extractSubdomain(hostname, MAIN_DOMAINS);
    const isStoreDomain = isUnderPrimary && isStoreSubdomain(hostname, MAIN_DOMAINS);
    if (isStoreDomain && subdomain) {
        // Already correctly rewritten?
        if (pathname.startsWith(`/${targetLocale}/${subdomain}`)) {
            return intlMiddleware(request);
        }
        const rewrite = request.nextUrl.clone();
        // Preserve trailing path (except root)
        const trailing = pathname === '/' ? '' : pathname;
        // If explicit locale was in path (e.g. /fr) and user visited fr.domain.tld/fr, we should not duplicate locale.
        // For subdomain host we ignore any leading locale segment in original path when building rewrite.
        const cleanedTrailing = hasExplicitLocale ? trailing.replace(/^\/(en|fr|ar)/, '') : trailing;
        rewrite.pathname = `/${targetLocale}/${subdomain}${cleanedTrailing}`;
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
