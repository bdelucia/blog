import BlogImageClient from "./BlogImageClient";
import { BLOG_IMGS_URL } from "@/lib/constants";

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
    baseUrl = BLOG_IMGS_URL,
    className = "w-full h-auto rounded-lg",
    caption,
    variant = "default",
}: BlogImageProps) {
    return (
        <BlogImageClient
            src={src}
            alt={alt}
            baseUrl={baseUrl}
            className={className}
            caption={caption}
            variant={variant}
        />
    );
}
