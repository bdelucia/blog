# SEO Setup Guide for Bob with a Blog

This guide will help you complete the SEO setup for your blog application.

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Required: Your site URL (update with your actual domain)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional: Search engine verification IDs
GOOGLE_VERIFICATION_ID=your_google_verification_id
YANDEX_VERIFICATION_ID=your_yandex_verification_id
YAHOO_VERIFICATION_ID=your_yahoo_verification_id

# Optional: Google Analytics (if not already set)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## SEO Features Implemented

### ✅ Dynamic Sitemap

-   **File**: `src/app/sitemap.ts`
-   **URL**: `https://yourdomain.com/sitemap.xml`
-   Automatically includes all published blog posts
-   Updates when new posts are published

### ✅ Robots.txt

-   **File**: `src/app/robots.ts`
-   **URL**: `https://yourdomain.com/robots.txt`
-   Blocks admin and API routes from search engines
-   Points to your sitemap

### ✅ RSS Feed

-   **File**: `src/app/feed.xml/route.ts`
-   **URL**: `https://yourdomain.com/feed.xml`
-   Includes all published blog posts
-   Proper RSS 2.0 format with CDATA sections

### ✅ Enhanced Metadata

-   **Files**: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/[slug]/page.tsx`
-   Comprehensive Open Graph and Twitter Card metadata
-   Dynamic title templates
-   Canonical URLs to prevent duplicate content
-   Enhanced descriptions and keywords

### ✅ Structured Data (JSON-LD)

-   **Files**: `src/app/layout.tsx`, `src/app/[slug]/page.tsx`
-   Website-level structured data
-   Blog post structured data with rich information
-   Author, publisher, and organization markup

### ✅ Breadcrumb Navigation

-   **File**: `src/components/shared/Breadcrumb.tsx`
-   **Usage**: Added to blog post pages
-   Structured data markup for breadcrumbs
-   Improves site navigation and SEO

### ✅ SEO Utilities

-   **File**: `src/lib/seo-utils.ts`
-   Smart description generation from content
-   Keyword extraction and optimization
-   SEO data validation and cleaning

### ✅ Optimized Image Component

-   **File**: `src/components/shared/OptimizedImage.tsx`
-   Uses Next.js Image component for optimal performance
-   Automatic image optimization and lazy loading
-   Fallback handling for failed image loads

## Next Steps

### 1. Update Your Information

-   Replace "Bob" with your actual name in:
    -   `src/app/layout.tsx` (lines 25, 26, 59)
    -   `src/app/[slug]/page.tsx` (line 423)
    -   `src/lib/seo-utils.ts` (line 89)
-   Update Twitter handle in `src/app/layout.tsx` (line 60) and `src/app/[slug]/page.tsx` (line 444)
-   Update GitHub URL in `src/app/layout.tsx` (line 25)

### 2. Create Default OG Image

Create a default Open Graph image at `public/images/og-default.jpg` (1200x630px). This will be used as a fallback for posts without custom images.

### 3. Verify Setup

After deployment, verify these URLs work:

-   `https://yourdomain.com/sitemap.xml`
-   `https://yourdomain.com/robots.txt`
-   `https://yourdomain.com/feed.xml`
-   `https://yourdomain.com/images/og-default.jpg`

### 4. Submit to Search Engines

-   **Google**: Submit your sitemap at [Google Search Console](https://search.google.com/search-console)
-   **Bing**: Submit your sitemap at [Bing Webmaster Tools](https://www.bing.com/webmasters)

### 5. Test SEO

Use these tools to test your SEO:

-   [Google Rich Results Test](https://search.google.com/test/rich-results)
-   [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
-   [Twitter Card Validator](https://cards-dev.twitter.com/validator)
-   [Open Graph Preview](https://www.opengraph.xyz/)

## Additional Recommendations

### Content Optimization

-   Write compelling meta descriptions (150-160 characters)
-   Use descriptive, keyword-rich titles
-   Add alt text to all images
-   Use heading tags (H1, H2, H3) properly
-   Include internal links between posts

### Technical SEO

-   Ensure fast loading times
-   Use HTTPS (SSL certificate)
-   Implement proper 404 error pages
-   Set up Google Analytics and Search Console
-   Monitor Core Web Vitals

### Content Strategy

-   Publish regularly
-   Create high-quality, original content
-   Use relevant tags and categories
-   Encourage social sharing
-   Build backlinks from reputable sites

## Monitoring

Track your SEO performance with:

-   Google Search Console
-   Google Analytics
-   Bing Webmaster Tools
-   Social media insights

Your blog is now optimized for search engines! 🚀
