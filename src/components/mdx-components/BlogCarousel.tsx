import BlogCarouselClient from "./BlogCarouselClient";
import { BLOG_IMGS_URL } from "@/lib/constants";

interface BlogCarouselProps {
    images?: string[];
}

export default function BlogCarousel({ images = [] }: BlogCarouselProps) {
    return <BlogCarouselClient images={images} baseUrl={BLOG_IMGS_URL} />;
}
