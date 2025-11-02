import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Extract subdomain from hostname
function getSubdomain(hostname: string): string | null {
    // Remove port if present
    const host = hostname.split(':')[0];
    
    // For localhost, check if it's in subdomain format (subdomain.localhost)
    if (host.includes('localhost')) {
        const parts = host.split('.');
        if (parts.length > 1 && parts[0] !== 'localhost') {
            return parts[0];
        }
        return null;
    }
    
    // For production domains (e.g., store.example.com)
    const parts = host.split('.');
    // If we have more than 2 parts, the first is the subdomain
    // Example: store.yura-saas.com -> ['store', 'yura-saas', 'com']
    if (parts.length >= 3) {
        return parts[0];
    }
    
    return null;
}

const intlMiddleware = createMiddleware({
    locales: ['en', 'fr', 'ar'],
    defaultLocale: 'en',
    localePrefix: 'as-needed', // This hides /en for default locale
});

export default function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const subdomain = getSubdomain(hostname);
    const pathname = request.nextUrl.pathname;
    
    // If subdomain exists and we're not already in a domain route or admin/dashboard routes
    if (subdomain && 
        !pathname.startsWith('/api') && 
        !pathname.startsWith('/_next') &&
        !pathname.startsWith('/admin') &&
        !pathname.startsWith('/dashboard') &&
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/signup') &&
        !pathname.startsWith('/onboarding')) {
        
        // Check if this is the main domain (www, app, or no subdomain pattern for main app)
        const mainDomains = ['www', 'app', 'admin', 'localhost'];
        if (mainDomains.includes(subdomain)) {
            // Main domain, use normal routing
            return intlMiddleware(request);
        }
        
        // It's a store subdomain - rewrite to subdomain route
        const url = request.nextUrl.clone();
        
        // Determine locale from pathname or use default
        const localeMatch = pathname.match(/^\/(en|fr|ar)/);
        const locale = localeMatch ? localeMatch[1] : 'en';
        
        // Remove locale prefix from pathname if present
        const pathWithoutLocale = pathname.replace(/^\/(en|fr|ar)/, '') || '/';
        
        // If pathname is root or locale root, go to store page
        if (pathname === '/' || pathname.match(/^\/(en|fr|ar)\/?$/)) {
            url.pathname = `/${locale}/${subdomain}`;
        } else if (pathWithoutLocale.startsWith('/shop/')) {
            // Product page on subdomain: /shop/[slug] -> /[locale]/[domain]/shop/[slug]
            url.pathname = `/${locale}/${subdomain}${pathWithoutLocale}`;
        } else {
            // Other paths on subdomain - prepend locale and subdomain
            url.pathname = `/${locale}/${subdomain}${pathWithoutLocale}`;
        }
        
        return NextResponse.rewrite(url);
    }
    
    // No subdomain or main app routes - use normal intl middleware
    return intlMiddleware(request);
}

export const config = {
    // Match all routes except Next.js internals and static files
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
