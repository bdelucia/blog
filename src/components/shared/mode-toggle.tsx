"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check if dark mode is enabled on initial load
        const isDarkMode = document.documentElement.classList.contains("dark");
        setIsDark(isDarkMode);

        // Listen for theme changes from other components
        const observer = new MutationObserver(() => {
            const isDarkMode =
                document.documentElement.classList.contains("dark");
            setIsDark(isDarkMode);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);

        if (newTheme) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    if (!mounted) {
        // Show a neutral button during SSR to prevent hydration mismatch
        return (
            <button
                className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Theme toggle"
            >
                <Sun className="h-4 w-4 text-gray-400" />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            {isDark ? (
                <Moon className="h-4 w-4 text-gray-300" />
            ) : (
                <Sun className="h-4 w-4 text-yellow-500" />
            )}
        </button>
    );
}
