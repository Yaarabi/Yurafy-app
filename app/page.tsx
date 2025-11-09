import { redirect } from 'next/navigation';

/**
 * Root page - redirects to default locale
 * Subdomain handling is done by middleware which rewrites to /en/{domain}
 */
export default function RootPage() {
    redirect('/en');
}
