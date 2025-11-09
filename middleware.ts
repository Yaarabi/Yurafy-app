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

    // Subdomain detection for store (only on our primary domain or localhost): rewrite to /en/{domain}[pathname]
    const subdomain = extractSubdomain(hostname, MAIN_DOMAINS);
    const isStoreDomain = isUnderPrimary && isStoreSubdomain(hostname, MAIN_DOMAINS);
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
