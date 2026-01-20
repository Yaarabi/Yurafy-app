# Services Page - Lighthouse Performance Audit Report

**Audit Date:** January 20, 2026  
**Device:** Moto G Power (Mobile) - Slow 4G  
**Lighthouse Version:** 13.0.1  

---

## Executive Summary

Your services page has **critical performance issues** with a score of **56/100**. The main bottleneck is JavaScript execution and rendering, causing poor Core Web Vitals. Below is a detailed analysis with actionable recommendations.

---

## Performance Scores

| Metric | Score | Status |
|--------|-------|--------|
| **Performance** | 56/100 | 🔴 Critical |
| **Accessibility** | 84/100 | 🟡 Needs Work |
| **Best Practices** | 77/100 | 🟡 Needs Work |
| **SEO** | 92/100 | 🟢 Good |

---

## Core Web Vitals & Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **FCP** (First Contentful Paint) | 1.7s | < 1.8s | 🟡 Needs improvement |
| **LCP** (Largest Contentful Paint) | 3.5s | < 2.5s | 🔴 **Poor** |
| **TBT** (Total Blocking Time) | 1,570ms | < 200ms | 🔴 **Critical** |
| **CLS** (Cumulative Layout Shift) | 0 | < 0.1 | 🟢 Good |
| **SI** (Speed Index) | 9.4s | < 3.8s | 🔴 **Critical** |

---

## Critical Issues Found

### 1. **High Total Blocking Time (1,570ms)** 🔴 CRITICAL
**Problem:** The main thread is blocked for 1.57 seconds, preventing user interaction.

**Root Causes Identified:**
- **Heavy Framer Motion Animations** - Complex `motion.div` components on:
  - `ServicesHero.tsx` - Rotating hexagons + animated dots
  - `HeroFeatureCards.tsx` - Infinite carousel with duplicated features (3x)
  - `TechStack.tsx` - Infinite carousel with duplicated tech logos (3x)
  - `ServicesFAQ.tsx` - Rotating decorative SVG shapes
  - `WebServices.tsx` - Spring animations on card entrance
  
- **Unoptimized Images** - TechStack loads 17 images without optimization:
  - Uses `unoptimized={true}` prop (disables Next.js optimization)
  - Loads from external CDN (raw.githubusercontent.com, bing.com, flaticon.com)
  - No lazy loading or responsive sizes
  - Some images don't have proper `sizes` attributes

- **Multiple Data Fetches on Page Load:**
  - `/api/guides/public?category=services` (ServicesVideo.tsx)
  - `/api/projects` (Projects.tsx)
  - These are fetched client-side with `fetch()` and `cache: 'no-store'`

### 2. **Large Cumulative JavaScript Bundle** 📦 CRITICAL
**Problem:** 3,656 KB total payload with 14 KiB of legacy JavaScript.

**JavaScript Execution Issues:**
- **3.6 seconds of JavaScript execution time**
- React icons library imported in multiple components
- Framer Motion overhead (animation library adds ~70KB)
- `react-datepicker`, `react-phone-input-2`, `nodemailer` in frontend dependencies

**Heavy Dependencies in Frontend:**
```json
- @google/generative-ai (AI integration)
- @langchain/langgraph, @langchain/mistralai (LLM chains)
- @mui/material (MUI + 300+ components)
- @ffmpeg-installer/ffmpeg (FFmpeg in browser?!)
- pdf-parse (PDF parsing in frontend?)
```

### 3. **Render-Blocking Resources**
**Problem:** Critical CSS and JavaScript delay First Paint.

**Issues Found:**
- Large CSS from Tailwind (unused CSS could be optimized)
- Multiple animated SVG elements in `ServicesHero.tsx`
- Framer Motion initialization overhead

### 4. **Slow LCP (3.5s)** 🔴 CRITICAL
**Root Causes:**
- Hero image (`/favi.png`) takes time to load
- Largest contentful element likely a service card or tech stack image
- Heavy JavaScript delays rendering of main content

### 5. **Unused CSS (12 KiB)**
**Problems:**
- Tailwind CSS generating unused utilities
- MUI Material styles (7.3MB library) likely 95% unused
- Unnecessary CSS from animations library

---

## Component-Level Issues

### [ServicesHero.tsx](app/[locale]/services/page.tsx)
**Issues:**
- ❌ Multiple `motion.div` with continuous animations (rotate: 360°)
- ❌ Complex SVG elements with animations
- ❌ Large radial gradients rendering cost
- ✅ Good: Uses `priority` for hero image

### [TechStack.tsx](components/services/TechStack.tsx)
**Issues:**
- ❌ **17 images loading with `unoptimized={true}`** - defeats Next.js optimization
- ❌ Infinite carousel animation duplicates array 3x
- ❌ Fetches from 3+ different CDNs
- ❌ No `loading="lazy"` attribute
- ❌ External images from GitHub raw, Bing, Flaticon CDNs

### [HeroFeatureCards.tsx](components/services/HeroFeatureCards.tsx)
**Issues:**
- ❌ Duplicates features array 3x for infinite scroll
- ❌ Complex motion animations with `whileHover` on each card
- ❌ Expensive backdrop-blur effects
- ❌ Multiple gradient overlays per card

### [Projects.tsx](components/services/Projects.tsx)
**Issues:**
- ❌ Fetches `/api/projects` client-side with `cache: 'no-store'`
- ❌ No error boundary
- ❌ Uses `<img>` tags with no optimization
- ✅ Good: Has cleanup for cancelled requests

### [ServicesVideo.tsx](components/services/ServicesVideo.tsx)
**Issues:**
- ❌ Fetches `/api/guides/public` client-side
- ❌ No cache strategy (forces fresh request every page load)
- ❌ Blocks rendering until guide loads
- ✅ Good: Returns null if no video

### [ServiceCard.tsx](components/services/ServiceCard.tsx)
**Issues:**
- ❌ `react-icons/fa` imported (FontAwesome icons loaded unnecessarily)
- ⚠️ Motion animations on each card entrance

### [ServicesFAQ.tsx](components/services/ServicesFAQ.tsx)
**Issues:**
- ❌ Animated SVG with 30s rotation animation
- ❌ Multiple motion components with expensive transitions

### [WebServices.tsx](components/services/WebServices.tsx)
**Issues:**
- ⚠️ Spring animations on cards (less expensive but still blocking)

---

## Accessibility Issues

### Missing Meta Description
- SEO audit shows "Document does not have a meta description"
- Page title exists but no description in metadata

### Labels & Names
- Some interactive elements lack discernible names
- Select elements missing associated labels
- Links without clear text

### Contrast Issues
- Background/foreground color contrast ratios are insufficient
- Likely in dark mode or gradient overlays

### Navigation
- Heading hierarchy not sequential (h1 → h3, skipping h2)
- Poor keyboard navigation flow

---

## Best Practices Issues

### Security Warnings
- ❌ **Uses 3rd-party cookies** (6 cookies found)
- ❌ Missing CSP headers for XSX protection
- ❌ Missing HSTS policy
- ❌ Missing COOP headers
- ⚠️ No XFO/clickjacking mitigation
- ⚠️ Trusted Types not enabled

### Architecture Issues
- ❌ Document missing `<main>` landmark
- ❌ Some links have identical purposes (duplicate links)

---

## SEO Issues

### Content Issues
- ❌ Missing `meta description` (critical for CTR)
- ⚠️ Content could be better structured for crawlers

---

## Performance Budget Breakdown

| Category | Size | % | Issue |
|----------|------|---|-------|
| JavaScript | ~1.2 MB | 33% | Heavy dependencies, unused code |
| Images | ~2.244 MB | 61% | Tech stack unoptimized images |
| CSS | ~100 KB | 3% | Unused Tailwind utilities |
| Fonts | ~50 KB | 1% | Font loading |
| Other | ~100 KB | 2% | |
| **Total** | **3,656 KB** | **100%** | **OVERSIZED** |

**Target for good performance:** < 1.5 MB

---

## 19 Long Tasks Found

Long tasks (>50ms) block main thread. Common causes:
1. Large JavaScript bundle parsing
2. Framer Motion animation initialization
3. Image rendering/optimization
4. Font loading

---

## Recommended Priority Fixes

### 🔴 P1 - Critical (Do First)

1. **Remove/Optimize Framer Motion Animations**
   - ServicesHero: Replace rotating hexagons with CSS animations (no JS cost)
   - HeroFeatureCards: Replace infinite scroll with CSS carousel
   - TechStack: Replace Framer Motion with CSS scroll animation
   - Impact: -40% TBT, -30% JS execution

2. **Fix TechStack Image Optimization**
   - Remove `unoptimized={true}` property
   - Add `loading="lazy"` to images below fold
   - Host images on your own CDN instead of external sources
   - Impact: -2,244 KB network payload, faster LCP

3. **Move API Calls to Server-Side**
   - Move `/api/guides/public` fetch to server-side in page.tsx
   - Move `/api/projects` fetch to server-side in page.tsx
   - Pre-render with Next.js ISR (revalidate: 3600)
   - Impact: -500ms LCP, faster FCP

4. **Remove Unused MUI Material**
   - Not used in services page
   - Remove from dependencies or use tree-shaking
   - Impact: -300+ KB bundle size

### 🟡 P2 - High Impact

5. **Add Meta Description**
   - Already has layout.tsx with metadata
   - Verify description is set correctly in all locales
   - Impact: +5 SEO score

6. **Fix Heading Hierarchy**
   - Use proper h1 → h2 → h3 sequence
   - Impact: +10 Accessibility score

7. **Optimize CSS**
   - Use PurgeCSS or Tailwind's content config properly
   - Remove unused Tailwind utilities
   - Impact: -12 KiB CSS, faster CSS parsing

8. **Add Security Headers**
   - Set CSP policy in middleware or next.config.ts
   - Add HSTS header
   - Add COOP header
   - Impact: +15 Best Practices score

9. **Fix Contrast Issues**
   - Review gradient overlays and dark mode colors
   - Ensure WCAG AA contrast (4.5:1 for text)
   - Impact: +15 Accessibility score

### 🟢 P3 - Medium Impact

10. **Add Image Optimization**
    - Set explicit dimensions on all images
    - Use `sizes` prop correctly
    - Consider WebP format with fallbacks

11. **Code Split Heavy Components**
    - Use `React.lazy()` + `Suspense` for below-fold sections
    - Lazy load ServicesFAQ, Projects, ServicesVideo

12. **Implement Font Strategy**
    - Use `font-display: swap` to prevent FOUT/FOIT
    - Preload critical fonts

---

## Next Steps

1. **Immediate (1-2 days):**
   - Fix TechStack image optimization
   - Move API calls to server-side
   - Replace Framer Motion with CSS animations

2. **Short-term (1 week):**
   - Add meta description
   - Fix accessibility issues (headings, contrast, labels)
   - Add security headers
   - Remove unused MUI dependency

3. **Long-term (ongoing):**
   - Implement code splitting
   - Set up performance budgets
   - Monitor Core Web Vitals in production
   - Consider using Vercel Analytics

---

## Expected Impact After Fixes

If all P1 fixes are implemented:
- **Performance: 56 → 85+** (TBT: 1,570ms → 200ms)
- **LCP: 3.5s → 2.0s**
- **FCP: 1.7s → 0.8s**
- **Accessibility: 84 → 94+**
- **Best Practices: 77 → 92+**

**Estimated Network Savings:** 2,200+ KB (60% reduction)
**Estimated JS Execution Time:** -3.6s (70% improvement)
