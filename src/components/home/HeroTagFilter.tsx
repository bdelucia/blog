"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { useTagFilter } from "@/components/providers/tag-filter-provider";
import { ShimmerButton } from "../ui/shimmer-button";
import { InteractiveHoverButton } from "../ui/interactive-hover-button";

interface HeroTagFilterProps {
    allTags: string[];
}

export function HeroTagFilter({ allTags }: HeroTagFilterProps) {
    const { selectedTags, toggleTag } = useTagFilter();

    const scrollToBlogSection = () => {
        setTimeout(() => {
            const blogSection = document.getElementById("blog-posts");
            if (blogSection) {
                const elementPosition = blogSection.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + window.pageYOffset - 100; // 100px offset from top

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });
            }
        }, 200);
    };

    const handleTagClick = (tag: string) => {
        const wasSelected = selectedTags.includes(tag);
        toggleTag(tag);

        // Only scroll if we're enabling/activating a tag (not disabling)
        if (!wasSelected) {
            scrollToBlogSection();
        }
    };

    return (
        <BlurFade delay={0.12}>
            <div className="max-w-4xl">
                <div className="inline-block">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                            Quick browse by filter:
                        </p>
                        <InteractiveHoverButton
                            onClick={scrollToBlogSection}
                            className="[&>svg]:w-2 [&>svg]:h-2 [&>svg]:translate-x-2 [&_.hover-text]:translate-x-2 bg-[#00FFFF] text-black [&>span:first-child]:opacity-0 [&>span:first-child]:text-transparent [&>div>div:first-child]:bg-black [&>div:last-child>span]:text-white [&>div:last-child>svg]:text-white"
                        >
                            Browse all posts
                        </InteractiveHoverButton>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <ShimmerButton
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                                        isSelected
                                            ? "text-gray-900 dark:text-white"
                                            : "text-gray-100 dark:text-white"
                                    }`}
                                    background={
                                        isSelected
                                            ? "rgba(243, 244, 246, 1)"
                                            : "rgba(31, 41, 55, 1)"
                                    }
                                    shimmerColor="#00FFFF"
                                    borderRadius="100px"
                                    shimmerDuration="2s"
                                >
                                    {tag}
                                </ShimmerButton>
                            );
                        })}
                    </div>
                </div>
            </div>
        </BlurFade>
    );
}
