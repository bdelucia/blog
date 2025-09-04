import { useEffect } from "react";
import { useTheme } from "../hooks/useTheme";

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        // Ensure theme is applied on initial load
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolvedTheme);
        root.setAttribute("data-theme", resolvedTheme);
    }, [resolvedTheme]);

    return <>{children}</>;
}
