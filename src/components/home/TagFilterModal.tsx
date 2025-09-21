"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface TagFilterModalProps {
    allTags: string[];
}

export function TagFilterModal({ allTags }: TagFilterModalProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const clearAll = () => {
        setSelectedTags([]);
    };

    const applyFilters = () => {
        // TODO: Implement actual filtering logic
        console.log("Selected tags:", selectedTags);
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
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                                        isSelected
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-800 dark:hover:text-blue-200"
                                    }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" size="sm" onClick={clearAll}>
                            Clear All
                        </Button>
                        <Button size="sm" onClick={applyFilters}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
