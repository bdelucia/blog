"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useTagFilter } from "@/components/providers/tag-filter-provider";
import { RainbowButton } from "@/components/magicui/rainbow-button";

interface TagFilterModalProps {
    allTags: string[];
}

export function TagFilterModal({ allTags }: TagFilterModalProps) {
    const { selectedTags, toggleTag, clearTags } = useTagFilter();

    const handleTagClick = (tag: string) => {
        const wasSelected = selectedTags.includes(tag);
        toggleTag(tag);

        // Only scroll if we're enabling/activating a tag (not disabling)
        if (!wasSelected) {
            // Smooth scroll to the blog section
            setTimeout(() => {
                const blogSection = document.getElementById("blog-posts");
                if (blogSection) {
                    const elementPosition =
                        blogSection.getBoundingClientRect().top;
                    const offsetPosition =
                        elementPosition + window.pageYOffset - 100; // 100px offset from top

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                }
            }, 200); // Increased delay for smoother transition
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter Tags
                    {selectedTags.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            {selectedTags.length}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Filter by Tags</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Select tags to filter posts:
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                        {allTags.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <RainbowButton
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                >
                                    {tag}
                                </RainbowButton>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" size="sm" onClick={clearTags}>
                            Clear All
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
