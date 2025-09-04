import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { forwardRef } from "react";
import { buttonVariants } from "../ui/button";
import { cn } from "../../lib/utils";
import { useTheme } from "../../hooks/useTheme";

export const ModeToggle = forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
    const { resolvedTheme, setTheme } = useTheme();

    const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                buttonVariants({
                    variant: "ghost",
                    size: "icon",
                }),
                "size-12 text-background"
            )}
            onClick={handleToggle}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    handleToggle(e);
                }
            }}
            aria-label={`Change Theme Button. The theme is currently ${
                resolvedTheme === "dark" ? "dark" : "light"
            }`}
            {...props}
        >
            <SunIcon className="h-4 w-4 dark:hidden" />
            <MoonIcon className="hidden h-4 w-4 dark:block" />
        </button>
    );
});

ModeToggle.displayName = "ModeToggle";
