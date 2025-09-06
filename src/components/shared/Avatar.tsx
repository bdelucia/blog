"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { User } from "lucide-react";

interface AvatarProps {
    src?: string | null;
    alt?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
};

export function Avatar({
    src,
    alt = "User avatar",
    className,
    size = "md",
}: AvatarProps) {
    const sizeClass = sizeClasses[size];

    if (!src) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700",
                    sizeClass,
                    className
                )}
            >
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "relative rounded-full overflow-hidden",
                sizeClass,
                className
            )}
        >
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                onError={(e) => {
                    // Hide the image and show fallback
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                        parent.innerHTML = `
                            <div class="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700">
                                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                        `;
                    }
                }}
            />
        </div>
    );
}
