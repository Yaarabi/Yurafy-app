import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { extractSubdomain, isStoreSubdomain } from '@/lib/utils/storeRouting';
import { routing } from './i18n/routing';

// Base subdomains considered part of the main app (not store subdomains)
const BASE_MAIN_DOMAINS = ['www', 'app', 'admin', 'localhost'];
const PROTECTED_ROUTES = ['/api', '/_next', '/admin', '/dashboard', '/login', '/signup', '/onboarding', '/verify-email', '/forgot-password', '/reset-password'];

// Internationalization middleware for main app
const intlMiddleware = createMiddleware(routing);

/**
 * Check if path is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Main middleware function
 */
export default function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const pathname = request.nextUrl.pathname;
    const url = request.nextUrl;

    // Define the main domain (without www or https://)
    const rootDomain = process.env.NEXT_PUBLIC_DOMAIN || "yurait.vercel.app";
    const primarySub = rootDomain ? rootDomain.split('.')[0] : '';
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
    const isUnderPrimary = rootDomain ? hostNoPort.endsWith(rootDomain) : isLocalhost;

    // Extract subdomain for store detection
    let subdomain = "";
    if (isLocalhost && hostNoPort.includes('.localhost')) {
        // For localhost: subdomain.localhost
        subdomain = hostNoPort.replace('.localhost', '').split('.')[0];
    } else if (isLocalhost) {
        subdomain = "";
    } else {
        // Production: extract subdomain
        subdomain = extractSubdomain(hostname, MAIN_DOMAINS) || "";
    }

    const isStoreDomain = isUnderPrimary && isStoreSubdomain(hostname, MAIN_DOMAINS) && subdomain;

    // Handle subdomain routing for stores
    if (isStoreDomain && subdomain) {
        // Check if the subdomain is not in main domains list
        if (MAIN_DOMAINS.includes(subdomain)) {
            // This is the main app, not a store
            return intlMiddleware(request);
        }

        // Determine target locale from path
        const pathSegments = pathname.split('/').filter(Boolean);
        let targetLocale: 'en' | 'fr' | 'ar' = routing.defaultLocale;
        let remainingPath = pathname;
        
        // Check if first segment is a valid locale
        if (pathSegments.length > 0 && routing.locales.includes(pathSegments[0] as any)) {
            targetLocale = pathSegments[0] as 'en' | 'fr' | 'ar';
            // Remove the locale from the path since we'll add it back in the rewrite
            remainingPath = '/' + pathSegments.slice(1).join('/');
        }

        // Avoid infinite rewrites - check if already rewritten
        if (pathname.startsWith(`/${targetLocale}/${subdomain}`)) {
            return intlMiddleware(request);
        }

        // Build the rewrite path: /{locale}/{subdomain}{remaining}
        const rewritePath = `/${targetLocale}/${subdomain}${remainingPath === '/' ? '' : remainingPath}`;
        const rewrite = new URL(rewritePath, request.url);
        return NextResponse.rewrite(rewrite);
    }

    // Main domain: run intl
    return intlMiddleware(request);
}

// Config: Run for all non-api/static files
export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
