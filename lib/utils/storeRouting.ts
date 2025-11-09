/**
 * Utility functions for subdomain/domain routing
 * Since [domain] is now at root level (app/[domain]), not nested in [locale]
 */

/**
 * Build store URL path
 * @param domain - Store domain
 * @param locale - Optional locale (defaults to 'en')
 * @param path - Optional path after domain (e.g., '/shop/product-slug')
 * @returns Formatted path: /[domain] or /[domain]/path
 */
export function buildStorePath(domain: string, locale?: string, path?: string): string {
    // Since [domain] is at root, we don't include locale in the path
    // Path structure: /[domain] or /[domain]/shop/...
    const basePath = `/${domain}`
    return path ? `${basePath}${path}` : basePath
}

/**
 * Build store URL with locale cookie handling
 * For client-side navigation
 */
export function buildStoreUrl(domain: string, locale: string = 'en', path?: string): {
    url: string
    shouldSetCookie: boolean
} {
    const url = buildStorePath(domain, locale, path)
    const shouldSetCookie = locale !== 'en' // Set cookie for non-default locales
    
    return { url, shouldSetCookie }
}

/**
 * Parse current path to extract domain and subpath
 * @param pathname - Current pathname (e.g., '/mydomain/shop/product')
 * @returns { domain, subpath }
 */
export function parseStorePath(pathname: string): { domain: string | null; subpath: string } {
    // Remove leading slash
    const parts = pathname.replace(/^\//, '').split('/')
    
    if (parts.length === 0 || !parts[0]) {
        return { domain: null, subpath: '/' }
    }
    
    // First segment is the domain
    const domain = parts[0]
    // Rest is the subpath
    const subpath = parts.length > 1 ? `/${parts.slice(1).join('/')}` : '/'
    
    return { domain, subpath }
}

/**
 * Check if current hostname is a subdomain
 * @param hostname - Current hostname
 * @param mainDomains - List of main domain prefixes (e.g., ['www', 'app', 'admin'])
 * @returns true if it's a store subdomain
 */
export function isStoreSubdomain(hostname: string, mainDomains: string[] = ['www', 'app', 'admin']): boolean {
    const host = hostname.split(':')[0] // Remove port
    
    // Localhost subdomain check
    if (host.includes('localhost')) {
        const parts = host.split('.')
        if (parts.length > 1 && parts[0] !== 'localhost' && !mainDomains.includes(parts[0])) {
            return true
        }
        return false
    }
    
    // Production subdomain check
    const parts = host.split('.')
    if (parts.length >= 3) {
        const subdomain = parts[0]
        return !mainDomains.includes(subdomain)
    }
    
    return false
}

/**
 * Extract subdomain from hostname
 */
export function extractSubdomain(hostname: string, mainDomains: string[] = ['www', 'app', 'admin']): string | null {
    const host = hostname.split(':')[0]
    
    // Localhost
    if (host.includes('localhost')) {
        const parts = host.split('.')
        if (parts.length > 1 && parts[0] !== 'localhost') {
            return parts[0]
        }
        return null
    }
    
    // Production
    const parts = host.split('.')
    if (parts.length >= 3) {
        return parts[0]
    }
    
    return null
}
