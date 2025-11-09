/**
 * Shared utility for subdomain extraction
 * Handles both development (localhost) and production domains
 * Supports Vercel domains (4 parts: subdomain.app.vercel.app)
 */

export interface SubdomainConfig {
    mainDomains?: string[]; // Domains that should not be treated as store subdomains
}

const DEFAULT_MAIN_DOMAINS = ['www', 'app', 'admin'];

/**
 * Extract subdomain from hostname
 * @param hostname - The hostname from request headers
 * @param config - Configuration options
 * @returns The subdomain or null if none found
 */
export function getSubdomain(
    hostname: string,
    config: SubdomainConfig = {}
): string | null {
    if (!hostname) return null;
    
    const mainDomains = config.mainDomains || DEFAULT_MAIN_DOMAINS;
    const host = hostname.split(':')[0]; // Remove port if present
    
    // Handle localhost/development
    if (host.includes('localhost') || host.startsWith('127.0.0.1') || host.startsWith('192.168.')) {
        const parts = host.split('.');
        // For localhost: subdomain.localhost or subdomain.127.0.0.1
        if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== '127' && parts[0] !== '192') {
            const subdomain = parts[0];
            // Don't treat main domains as subdomains even in localhost
            return mainDomains.includes(subdomain) ? null : subdomain;
        }
        return null;
    }
    
    // For production domains
    const parts = host.split('.');
    
    // Handle Vercel domains: subdomain.app.vercel.app (4 parts)
    // Handle regular domains: subdomain.example.com (3 parts)
    // If we have 3+ parts, the first is potentially a subdomain
    if (parts.length >= 3) {
        const potentialSubdomain = parts[0];
        // Don't treat main domains as store subdomains
        if (mainDomains.includes(potentialSubdomain)) {
            return null;
        }
        return potentialSubdomain;
    }
    
    return null;
}

/**
 * Extract subdomain from Next.js headers (server-side)
 * @param headersFn - Next.js headers() function
 * @param config - Configuration options
 * @returns The subdomain or null if none found
 */
export async function getSubdomainFromHeaders(
    headersFn: () => Promise<Headers> | Headers,
    config: SubdomainConfig = {}
): Promise<string | null> {
    try {
        const headersList = await Promise.resolve(headersFn());
        const host = headersList.get('host') || '';
        return getSubdomain(host, config);
    } catch (error) {
        console.error('Error extracting subdomain from headers:', error);
        return null;
    }
}

/**
 * Check if a hostname is a store subdomain (not a main domain)
 * @param hostname - The hostname to check
 * @param config - Configuration options
 * @returns true if it's a store subdomain
 */
export function isStoreSubdomain(
    hostname: string,
    config: SubdomainConfig = {}
): boolean {
    const subdomain = getSubdomain(hostname, config);
    return subdomain !== null;
}

