# Domain Update to yurafy.com

## Overview
This document outlines the migration from `yurait.vercel.app` to `yurafy.com` across the entire codebase.

## Files Updated

### Core Configuration Files

#### 1. **app/layout.tsx**
- Updated default baseUrl fallback: `https://yurait.vercel.app` → `https://yurafy.com`
- Affects: Root metadata, OpenGraph tags, Twitter cards

#### 2. **app/[locale]/layout.tsx**
- Updated default baseUrl fallback: `https://yurait.vercel.app` → `https://yurafy.com`
- Affects: Localized metadata for all supported languages (en/fr/ar)

#### 3. **app/sitemap.ts**
- Updated default baseUrl: `https://yurait.vercel.app` → `https://yurafy.com`
- Updated default domain: `yurait.vercel.app` → `yurafy.com`
- Affects: XML sitemap generation for SEO

#### 4. **app/robots.ts**
- Updated default baseUrl: `https://yurait.vercel.app` → `https://yurafy.com`
- Affects: Robots.txt configuration for search engine crawlers

#### 5. **next.config.ts**
- Removed: `*.yurait.vercel.app` from image remotePatterns
- Added: `*.yurafy.com` and `yurafy.com` to image remotePatterns
- Affects: Next.js Image optimization for custom subdomains

#### 6. **middleware.ts**
- Updated MAIN_DOMAINS: `'yurait'` → `'yurafy'`
- Updated comment: "Vercel project domain (yurait)" → "main domain (yurafy)"
- Affects: Subdomain routing logic

### Metadata & SEO Files

#### 7. **lib/metadata/storeMetadata.ts**
- Updated default baseUrl: `https://yurait.vercel.app` → `https://yurafy.com`
- Affects: Store metadata generation for SEO

#### 8. **lib/metadata/productMetadata.ts**
- Updated default baseUrl: `https://yurait.vercel.app` → `https://yurafy.com`
- Affects: Product metadata generation for SEO

#### 9. **lib/metadata/url.ts**
- Updated MAIN_DOMAINS: `'yurait'` → `'yurafy'`
- Updated default host fallbacks: `yurait.vercel.app` → `yurafy.com` (2 occurrences)
- Affects: URL building for stores and products

### Utility Files

#### 10. **lib/utils/subdomain.ts**
- Updated file header comment: "Vercel domains" → "production domains (yurafy.com)"
- Updated code comments:
  - "subdomain-appname.vercel.app" → "subdomain-appname.domain.com"
  - "store1-yurait.vercel.app" → "store1-yurafy.com"
  - "subdomain.app.vercel.app" → "subdomain.yurafy.com"
- Affects: Subdomain extraction logic

### Documentation Files

#### 11. **public/llms.txt**
- Added: Website URL `https://yurafy.com` in Support section
- Affects: LLM context and API documentation

#### 12. **README.md**
- Updated support email: `support@yura-saas.com` → `support@yurafy.com` (2 occurrences)
- Added: Website URL `https://yurafy.com` in Contact section
- Affects: Developer documentation

#### 13. **SECURITY_AUDIT.md**
- Updated NEXTAUTH_URL example: `https://yurait.vercel.app` → `https://yurafy.com`
- Affects: Security configuration documentation

### Component Files (Comments)

#### 14. **components/store/themes/theme8/ProductPage.tsx**
- Updated comments: `store.yura-saas.com` → `store.yurafy.com`
- Updated comments: `coutanova.localhost` → `store.localhost`

#### 15. **components/store/themes/theme9/ProductPage.tsx**
- Updated comments: `store.yura-saas.com` → `store.yurafy.com`
- Updated comments: `coutanova.localhost` → `store.localhost`

#### 16. **components/store/themes/theme1/ProductPage.tsx**
- Updated comments: `store.yura-saas.com` → `store.yurafy.com`

## Environment Variables Required

To complete the migration, ensure the following environment variables are set in your deployment:

### Production Environment Variables
```env
NEXT_PUBLIC_BASE_URL=https://yurafy.com
NEXT_PUBLIC_DOMAIN=yurafy.com
NEXTAUTH_URL=https://yurafy.com
```

### Development Environment Variables
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_DOMAIN=localhost
NEXTAUTH_URL=http://localhost:3000
```

## DNS Configuration

### Required DNS Records for yurafy.com:

1. **Root Domain (yurafy.com)**
   - Type: A or CNAME
   - Points to: Your hosting provider's IP/domain
   
2. **Wildcard Subdomain (*.yurafy.com)**
   - Type: CNAME
   - Points to: Your hosting provider's domain
   - Purpose: Allow dynamic store subdomains (e.g., store1.yurafy.com, store2.yurafy.com)

3. **WWW Subdomain (www.yurafy.com)** - Optional
   - Type: CNAME
   - Points to: yurafy.com

### Example for Vercel:
If deploying on Vercel, add these domains in project settings:
- `yurafy.com`
- `*.yurafy.com`
- `www.yurafy.com` (optional)

## SEO Impact

### Positive Changes:
- ✅ Branded domain improves trust and credibility
- ✅ Shorter, memorable domain name
- ✅ Consistent with business branding (Yurafy)
- ✅ All metadata and OpenGraph tags updated
- ✅ Sitemap and robots.txt properly configured

### Migration Checklist:
- [ ] Update environment variables in production
- [ ] Configure DNS records for yurafy.com
- [ ] Add domain to hosting provider (Vercel/etc)
- [ ] Set up SSL certificate (automatic with Vercel)
- [ ] Test all subdomain routing
- [ ] Verify image optimization works
- [ ] Test metadata generation
- [ ] Submit new sitemap to Google Search Console
- [ ] Set up 301 redirects from old domain (if needed)

## Subdomain Architecture

The platform supports two routing methods:

### 1. Subdomain-based (Recommended for Production)
- Format: `https://storename.yurafy.com`
- Main domains: `www.yurafy.com`, `app.yurafy.com`, `admin.yurafy.com`
- Store domains: Any other subdomain (e.g., `mystore.yurafy.com`)

### 2. Path-based (Fallback)
- Format: `https://yurafy.com/[locale]/[storename]`
- Used when subdomain routing is not available

## Testing

### Local Testing with Subdomains:
1. Edit your hosts file:
   ```
   127.0.0.1 store.localhost
   127.0.0.1 teststore.localhost
   ```

2. Access stores:
   - Main app: `http://localhost:3000`
   - Store 1: `http://store.localhost:3000`
   - Store 2: `http://teststore.localhost:3000`

### Production Testing:
1. Verify main domain: `https://yurafy.com`
2. Test store subdomains: `https://[storename].yurafy.com`
3. Check metadata in browser DevTools
4. Validate sitemap: `https://yurafy.com/sitemap.xml`
5. Check robots.txt: `https://yurafy.com/robots.txt`

## Rollback Plan

If issues arise, rollback by reverting these environment variables:
```env
NEXT_PUBLIC_BASE_URL=https://yurait.vercel.app
NEXT_PUBLIC_DOMAIN=yurait.vercel.app
NEXTAUTH_URL=https://yurait.vercel.app
```

Note: Code changes support both domains through environment variables, so no code rollback needed.

## Summary

**Total Files Modified:** 16
- Configuration files: 6
- Metadata/SEO files: 3
- Utility files: 1
- Documentation files: 3
- Component files: 3

**Domain Changes:**
- `yurait.vercel.app` → `yurafy.com`
- `*.yurait.vercel.app` → `*.yurafy.com`
- `support@yura-saas.com` → `support@yurafy.com`

**No Breaking Changes:**
All changes use environment variable fallbacks, ensuring backward compatibility during migration.

## Last Updated
November 13, 2025
