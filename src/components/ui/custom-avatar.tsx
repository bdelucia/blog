"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CustomAvatarProps {
    src?: string;
    alt: string;
    fallback: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-xs",
    lg: "h-12 w-12 text-sm",
};

export function CustomAvatar({
    src,
    alt,
    fallback,
    className,
    size = "md",
}: CustomAvatarProps) {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const handleImageError = () => {
        console.error("CustomAvatar: Image failed to load:", src);
        setImageError(true);
    };

    const handleImageLoad = () => {
        console.log("CustomAvatar: Image loaded successfully:", src);
        setImageLoaded(true);
    };

    // If no src or image failed to load, show fallback
    if (!src || imageError) {
        return (
            <div
                className={cn(
                    "relative flex shrink-0 overflow-hidden rounded-full bg-muted",
                    sizeClasses[size],
                    className
                )}
            >
                <div className="flex h-full w-full items-center justify-center">
                    {fallback}
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full",
                sizeClasses[size],
                className
            )}
        >
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
                sizes="(max-width: 768px) 32px, 32px"
            />
            {/* Show fallback while loading */}
            {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    {fallback}
                </div>
            )}
        </div>
    );
}
