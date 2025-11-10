import { redirect } from 'next/navigation';

/**
 * Root page - redirects to default locale
 * 
 * Note: Subdomain routing is now handled by middleware.ts
 * - Store subdomains are rewritten to /[locale]/[domain]
 * - Main domain requests land here and redirect to /en
 */
export default function RootPage() {
    // Middleware handles subdomain rewriting to /[locale]/[domain]
    // This page only handles main domain root requests
    redirect('/en');
}
