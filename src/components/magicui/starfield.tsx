"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StarfieldProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Number of stars to generate
     * @default 100
     */
    starCount?: number;
    /**
     * Animation duration in seconds
     * @default 20
     */
    duration?: number;
    /**
     * Star color
     * @default "#ffffff"
     */
    starColor?: string;
    /**
     * Star size range (min, max) in pixels
     * @default [1, 3]
     */
    starSize?: [number, number];
}

/**
 * Starfield
 *
 * An animated starfield background component with configurable properties.
 */
export function Starfield({
    starCount = 100,
    duration = 20,
    starColor = "#ffffff",
    starSize = [1, 3],
    className,
    style,
    ...props
}: StarfieldProps) {
    const [stars, setStars] = React.useState<
        Array<{
            id: number;
            x: number;
            y: number;
            size: number;
            delay: number;
        }>
    >([]);

    React.useEffect(() => {
        const generateStars = () => {
            const newStars = Array.from({ length: starCount }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * (starSize[1] - starSize[0]) + starSize[0],
                delay: Math.random() * duration,
            }));
            setStars(newStars);
        };

        generateStars();
    }, [starCount, starSize, duration]);

    return (
        <div
            className={cn(
                "absolute inset-0 overflow-hidden pointer-events-none",
                className
            )}
            style={style}
            {...props}
        >
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute rounded-full animate-pulse"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: starColor,
                        animationDelay: `${star.delay}s`,
                        animationDuration: `${duration}s`,
                        opacity: Math.random() * 0.8 + 0.2,
                    }}
                />
            ))}
        </div>
    );
}
