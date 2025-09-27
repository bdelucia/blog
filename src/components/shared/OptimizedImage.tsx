import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    fill?: boolean;
    sizes?: string;
    quality?: number;
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = "",
    priority = false,
    fill = false,
    sizes,
    quality = 75,
    placeholder = "empty",
    blurDataURL,
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Handle different image sources
    const getImageSrc = () => {
        if (src.startsWith("http")) {
            return src;
        }
        return src;
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    if (hasError) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}
                style={{ width, height }}
            >
                <span className="text-gray-500 text-sm">
                    Image failed to load
                </span>
            </div>
        );
    }

    const imageProps = {
        src: getImageSrc(),
        alt,
        className: `${className} ${
            isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`,
        quality,
        placeholder,
        blurDataURL,
        onLoad: handleLoad,
        onError: handleError,
        ...(fill
            ? {
                  fill: true,
                  sizes:
                      sizes ||
                      "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
              }
            : {
                  width,
                  height,
              }),
        ...(priority && { priority }),
    };

    return <Image {...imageProps} />;
}

