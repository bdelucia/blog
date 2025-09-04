import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        // Check localStorage first
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("theme") as Theme;
            if (stored && ["light", "dark", "system"].includes(stored)) {
                return stored;
            }
        }

        // Fallback to system preference
        if (typeof window !== "undefined" && window.matchMedia) {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                return "dark";
            }
        }

        return "light";
    });

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
        "light"
    );

    useEffect(() => {
        const root = window.document.documentElement;

        const updateTheme = () => {
            let finalTheme: "light" | "dark";

            if (theme === "system") {
                finalTheme = window.matchMedia("(prefers-color-scheme: dark)")
                    .matches
                    ? "dark"
                    : "light";
            } else {
                finalTheme = theme;
            }

            setResolvedTheme(finalTheme);

            // Update class on document element
            root.classList.remove("light", "dark");
            root.classList.add(finalTheme);

            // Update data attribute for CSS variables
            root.setAttribute("data-theme", finalTheme);
        };

        updateTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                updateTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, [theme]);

    const updateTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return {
        theme,
        setTheme: updateTheme,
        resolvedTheme,
    };
}
