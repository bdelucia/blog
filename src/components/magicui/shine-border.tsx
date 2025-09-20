"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Width of the border in pixels
     * @default 1
     */
    borderWidth?: number;
    /**
     * Duration of the animation in seconds
     * @default 14
     */
    duration?: number;
    /**
     * Color of the border, can be a single color or an array of colors
     * @default "#000000"
     */
    shineColor?: string | string[];
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 */
export function ShineBorder({
    borderWidth = 3,
    duration = 14,
    shineColor = "#00FFFF",
    className,
    style,
    ...props
}: ShineBorderProps) {
    // Determine colors based on theme
    const lightModeColor = [
        "#000000",
        "#000000",
        "#00FFFF",
        "#000000",
        "#00FFFF",
        "#000000",
    ];
    const darkModeColor = Array.isArray(shineColor)
        ? shineColor.join(",")
        : shineColor;

    return (
        <div
            style={
                {
                    "--border-width": `${borderWidth}px`,
                    "--duration": `${duration}s`,
                    "--light-color": lightModeColor,
                    "--dark-color": darkModeColor,
                    backgroundSize: "300% 300%",
                    mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                    WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    padding: "var(--border-width)",
                    // Set the background image directly in style for better compatibility
                    backgroundImage: `radial-gradient(transparent, transparent, var(--light-color), transparent, transparent)`,
                    ...style,
                } as React.CSSProperties
            }
            className={cn(
                "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine",
                // Override with dark mode colors when in dark theme
                "dark:!bg-[radial-gradient(transparent,transparent,var(--dark-color),transparent,transparent)]",
                className
            )}
            {...props}
        />
    );
}
