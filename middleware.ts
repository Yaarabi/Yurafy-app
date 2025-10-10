import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales: ['en', 'fr', 'ar'],
    defaultLocale: 'en',
    localePrefix: 'as-needed', //  This hides /en for default locale
});

export const config = {
    // Match all routes except Next.js internals and static files
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
