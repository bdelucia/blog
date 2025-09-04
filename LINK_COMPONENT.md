# Custom Link Component

This project now uses a custom Link component that's Vite-friendly and doesn't depend on Next.js.

## Features

### 1. Internal Navigation

-   Handles internal links with client-side navigation
-   Uses `window.location.href` for simple navigation
-   Prevents default behavior for internal links

### 2. External Link Support

-   Automatically detects external links (http, https, mailto, tel)
-   Opens external links in new tabs with proper security attributes
-   Supports `external` prop for manual external link marking

### 3. Accessibility

-   Maintains proper anchor tag semantics
-   Supports all standard anchor attributes
-   Includes proper `rel` attributes for external links

## Usage

### Basic Internal Link

```tsx
import { Link } from "../components/ui/link";

<Link href="/blog">Go to Blog</Link>;
```

### External Link

```tsx
<Link href="https://example.com" external>
    External Site
</Link>
```

### With Styling

```tsx
<Link href="/about" className="text-blue-500 hover:text-blue-700">
    About Us
</Link>
```

### With Additional Props

```tsx
<Link
    href="/contact"
    className="button"
    onClick={() => console.log("Link clicked")}
>
    Contact
</Link>
```

## Migration from Next.js Link

The Next.js Link component has been completely replaced with this custom implementation. The API is similar but simplified:

### Before (Next.js)

```tsx
import Link from "next/link";

<Link href="/blog" className="...">
    Blog
</Link>;
```

### After (Custom)

```tsx
import { Link } from "../components/ui/link";

<Link href="/blog" className="...">
    Blog
</Link>;
```

## Customization

You can easily extend this component to work with your preferred routing solution:

1. **React Router**: Replace `window.location.href` with `navigate(href)`
2. **TanStack Router**: Use the router's navigation methods
3. **Custom Router**: Implement your own navigation logic

## Benefits

-   ✅ No Next.js dependencies
-   ✅ Vite compatible
-   ✅ TypeScript support
-   ✅ Flexible and extensible
-   ✅ Maintains accessibility
-   ✅ Supports external links
-   ✅ Simple API
