"use client";

import { useState, useEffect } from "react";

export function useTheme() {
    const [theme, setTheme] = useState<"light" | "dark" | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check if dark mode is enabled on initial load
        const isDarkMode = document.documentElement.classList.contains("dark");
        setTheme(isDarkMode ? "dark" : "light");

        // Listen for theme changes
        const observer = new MutationObserver(() => {
            const isDarkMode =
                document.documentElement.classList.contains("dark");
            setTheme(isDarkMode ? "dark" : "light");
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    return { theme, mounted };
}
