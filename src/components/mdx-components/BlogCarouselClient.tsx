"use client";

import * as React from "react";
import Image from "next/image";
// BLOG_IMGS_URL is passed as a prop instead of imported
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogCarouselClientProps {
    images?: string[];
    baseUrl?: string;
}

export default function BlogCarouselClient({
    images = [],
    baseUrl = "",
}: BlogCarouselClientProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // If 1 or less images provided, don't render anything
    if (images.length <= 1) return null;

    const nextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex(
            (prevIndex) => (prevIndex - 1 + images.length) % images.length
        );
    };

    // Multiple images - render with carousel navigation
    return (
        <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[400px]">
                <div className="relative overflow-hidden rounded-lg">
                    <Image
                        src={`${baseUrl}${images[currentIndex]}`}
                        alt={`Carousel image ${currentIndex + 1}`}
                        className="w-full h-auto"
                        width={384}
                        height={512}
                    />
                </div>

                {/* Navigation buttons */}
                <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    aria-label="Next image"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Image indicators */}
                <div className="flex justify-center mt-2 space-x-1">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentIndex
                                    ? "bg-blue-500"
                                    : "bg-gray-300"
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
