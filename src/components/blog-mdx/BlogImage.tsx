import { Card, CardContent } from "../ui/card";
import { useState } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface BlogImageProps {
    src: string;
    alt: string;
    baseUrl?: string;
    className?: string;
    caption?: string;
    variant?: "default" | "center";
}

export default function BlogImage({
    src,
    alt,
    baseUrl,
    className = "w-full h-auto rounded-lg",
    caption,
    variant = "default",
}: BlogImageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // If src doesn't start with http, prepend the baseUrl
    const imageSrc = src.startsWith("http") ? src : `${baseUrl}${src}`;

    const handleImageClick = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const imageContent = (
        <Card className="bg-transparent">
            <CardContent className="p-1">
                <img
                    src={imageSrc}
                    alt={alt}
                    className={`${className} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={handleImageClick}
                />
            </CardContent>
            {caption && (
                <div className="flex italic items-center justify-center -mt-8 -mb-8">
                    <p>{caption}</p>
                </div>
            )}
        </Card>
    );

    // Proper modal using shadcn/ui patterns
    const modal = (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Modal Content */}
                    <div className="relative z-50 max-w-2xl max-h-[90vh] overflow-hidden rounded-lg bg-background shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex-1" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {alt}
                            </h3>
                            <div className="flex-1 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={closeModal}
                                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </Button>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="p-4">
                            <div className="relative">
                                <img
                                    src={imageSrc}
                                    alt={alt}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Footer with caption */}
                        {caption && (
                            <div className="border-t border-gray-200 dark:border-gray-700">
                                <p className="text-center text-gray-600 dark:text-gray-400 italic">
                                    {caption}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );

    // Conditionally wrap with centering div
    if (variant === "center") {
        return (
            <div className="flex items-center justify-center">
                {imageContent}
                {modal}
            </div>
        );
    }

    return (
        <>
            {imageContent}
            {modal}
        </>
    );
}
