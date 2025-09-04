# Theme System Setup

This project now uses a custom theme system that's Vite-friendly and doesn't depend on Next.js.

## How it works

### 1. Theme Hook (`src/hooks/useTheme.ts`)

-   Manages theme state (light, dark, system)
-   Persists theme preference in localStorage
-   Automatically detects system theme preference
-   Updates CSS classes and data attributes

### 2. Theme Provider (`src/components/ThemeProvider.tsx`)

-   Wraps the app to ensure theme is properly initialized
-   Handles theme changes and applies them to the document

### 3. Mode Toggle (`src/components/shared/mode-toggle.tsx`)

-   Uses the custom `useTheme` hook
-   Toggles between light and dark themes
-   Provides proper accessibility attributes

### 4. CSS Variables

The theme system uses CSS custom properties defined in `src/index.css`:

-   Light theme variables in `:root`
-   Dark theme variables in `.dark`
-   Tailwind CSS classes automatically use these variables

## Usage

### In Components

```tsx
import { useTheme } from "../hooks/useTheme";

function MyComponent() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    return (
        <button onClick={() => setTheme("dark")}>Switch to Dark Mode</button>
    );
}
```

### Theme Values

-   `theme`: Current theme setting ('light', 'dark', 'system')
-   `setTheme`: Function to change theme
-   `resolvedTheme`: Actual applied theme ('light' or 'dark')

## Features

-   ✅ No flash of unstyled content (FOUC)
-   ✅ System theme detection
-   ✅ Theme persistence in localStorage
-   ✅ Automatic theme switching
-   ✅ Vite compatible
-   ✅ TypeScript support
-   ✅ Accessibility friendly

## Migration from Next.js Theme

The old Next.js theme system has been completely replaced with this custom implementation. All components now use the new `useTheme` hook instead of `next-themes`.
