import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../ui/carousel";
import { Card, CardContent } from "../ui/card";
import { BLOG_IMGS_URL } from "../../data/blog";

interface BlogCarouselProps {
    images?: string[];
}

export default function BlogCarousel({ images = [] }: BlogCarouselProps) {
    // If 1 or less images provided, don't render anything
    if (images.length <= 1) return;

    // Multiple images - render with carousel navigation
    return (
        <div className="flex items-center justify-center">
            <Carousel className="w-full max-w-[400px]">
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={index}>
                            <div className="p-1">
                                <Card className="bg-transparent">
                                    <CardContent className="p-1">
                                        <img
                                            src={`${BLOG_IMGS_URL}${image}`}
                                            alt={`Carousel image ${index + 1}`}
                                            className="w-full h-auto rounded-lg"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious
                    variant="default"
                    className="bg-foreground text-background hover:bg-background hover:text-foreground max-[520px]:-left-2"
                />
                <CarouselNext
                    variant="default"
                    className="bg-foreground text-background hover:bg-background hover:text-foreground max-[520px]:-right-2"
                />
            </Carousel>
        </div>
    );
}
