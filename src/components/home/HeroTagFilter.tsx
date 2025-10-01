"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { useTagFilter } from "@/components/providers/tag-filter-provider";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { CyanButton } from "@/components/magicui/cyan-button";
import { useTheme } from "@/hooks/useTheme";

interface HeroTagFilterProps {
    allTags: string[];
}

export function HeroTagFilter({ allTags }: HeroTagFilterProps) {
    const { selectedTags, toggleTag } = useTagFilter();
    const { theme, mounted: themeMounted } = useTheme();

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
                    <div className="mb-4">
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                            Quick browse by filter:
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => {
                            return !themeMounted ? (
                                // Show a neutral button during SSR to prevent hydration mismatch
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className="h-8 px-3 text-sm font-semibold bg-black text-white rounded-xl"
                                >
                                    {tag}
                                </button>
                            ) : theme === "dark" ? (
                                <RainbowButton
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    variant="default"
                                    size="sm"
                                    className="text-sm font-semibold"
                                >
                                    {tag}
                                </RainbowButton>
                            ) : (
                                <CyanButton
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    variant="default"
                                    size="sm"
                                    className="text-sm font-semibold"
                                >
                                    {tag}
                                </CyanButton>
                            );
                        })}
                    </div>
                </div>
            </div>
        </BlurFade>
    );
}
