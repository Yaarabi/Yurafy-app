import { headers } from 'next/headers';
import { getSubdomainFromHeaders } from '@/lib/utils/subdomain';

interface UrlOptions {
  locale?: string;
  storeDomain?: string; // path param domain
  productSlug?: string;
}

const MAIN_DOMAINS = ['www', 'app', 'admin', 'yurafy'];

export async function buildStoreUrl({ locale = 'en', storeDomain }: UrlOptions): Promise<string> {
  const hdrs = await headers();
  const host = hdrs.get('host') || 'yurafy.com';
  const xSub = hdrs.get('x-subdomain');
  const subdomain = xSub || await getSubdomainFromHeaders(headers, { mainDomains: MAIN_DOMAINS });

  // If we are already on the subdomain host, prefer that form
  if (subdomain) {
    // Normalize to subdomain form
    return `https://${subdomain}.${rootDomain(host)}`;
  }

  // Path-based fallback
  if (!storeDomain) return `https://${host}`;
  return `https://${host}/${locale}/${storeDomain}`;
}

export async function buildProductUrl({ locale = 'en', storeDomain, productSlug }: UrlOptions): Promise<string> {
  if (!productSlug) return '';
  const hdrs = await headers();
  const host = hdrs.get('host') || 'yurafy.com';
  const xSub = hdrs.get('x-subdomain');
  const subdomain = xSub || await getSubdomainFromHeaders(headers, { mainDomains: MAIN_DOMAINS });

  if (subdomain) {
    return `https://${subdomain}.${rootDomain(host)}/shop/${encodeURIComponent(productSlug)}`;
  }
  if (!storeDomain) {
    return `https://${host}/shop/${encodeURIComponent(productSlug)}`;
  }
  return `https://${host}/${locale}/${storeDomain}/shop/${encodeURIComponent(productSlug)}`;
}

function rootDomain(host: string): string {
  // Strip first label if more than 2 parts (e.g., mystore.yurait.vercel.app -> yurait.vercel.app)
  const parts = host.split(':')[0].split('.');
  if (parts.length <= 2) return host.split(':')[0];
  return parts.slice(-3).join('.'); // Keep last 3 for vercel.app, etc.
}
