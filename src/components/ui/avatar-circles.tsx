"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface Avatar {
    imageUrl: string;
    profileUrl: string;
}
interface AvatarCirclesProps {
    className?: string;
    numPeople?: number;
    avatarUrls: Avatar[];
}

export const AvatarCircles = ({
    numPeople,
    className,
    avatarUrls,
}: AvatarCirclesProps) => {
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

    const handleImageError = (index: number) => {
        setImageErrors((prev) => new Set(prev).add(index));
    };

    const isGoogleAvatar = (url: string) => {
        return (
            url.includes("googleusercontent.com") ||
            url.includes("googleapis.com")
        );
    };

    const getGoogleAvatarUrl = (originalUrl: string) => {
        // For Google avatars, try different size parameters and formats
        if (originalUrl.includes("googleusercontent.com")) {
            // Try different size parameters that might work better
            const sizeVariants = ["s40-c", "s48-c", "s64-c", "s96-c"];

            // Try to replace the size parameter
            for (const size of sizeVariants) {
                const testUrl = originalUrl.replace(/=s\d+-c$/, `=${size}`);
                if (testUrl !== originalUrl) {
                    return testUrl;
                }
            }

            // If no size parameter found, add one
            if (!originalUrl.includes("=s")) {
                return `${originalUrl}=s40-c`;
            }
        }
        return originalUrl;
    };

    return (
        <div
            className={cn(
                "z-10 flex -space-x-4 rtl:space-x-reverse",
                className
            )}
        >
            {avatarUrls.map((url, index) => {
                const hasError = imageErrors.has(index);
                const optimizedUrl = isGoogleAvatar(url.imageUrl)
                    ? getGoogleAvatarUrl(url.imageUrl)
                    : url.imageUrl;

                return (
                    <a
                        key={index}
                        href={url.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            key={index}
                            className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
                            src={hasError ? "" : optimizedUrl}
                            width={40}
                            height={40}
                            alt={`Avatar ${index + 1}`}
                            onError={() => handleImageError(index)}
                            crossOrigin="anonymous"
                        />
                    </a>
                );
            })}
            {(numPeople ?? 0) >= 0 && (
                <a
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black"
                    href=""
                >
                    +{numPeople}
                </a>
            )}
        </div>
    );
};
