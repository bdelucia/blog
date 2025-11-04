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
        toggleTag(tag);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 cursor-pointer"
                >
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
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                                        isSelected
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearTags}
                            className="cursor-pointer"
                        >
                            Clear All
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
