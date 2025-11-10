import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'ar'],
  defaultLocale: 'en',
  // 'as-needed' means default locale (en) is at "/" without prefix
  // Other locales (fr, ar) get prefixes: "/fr", "/ar"
  localePrefix: 'as-needed',
});
