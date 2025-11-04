"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface TagFilterContextType {
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
    toggleTag: (tag: string) => void;
    selectTag: (tag: string) => void;
    clearTags: () => void;
}

const TagFilterContext = createContext<TagFilterContextType | undefined>(
    undefined
);

export function TagFilterProvider({ children }: { children: ReactNode }) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const selectTag = (tag: string) => {
        setSelectedTags([tag]);
    };

    const clearTags = () => {
        setSelectedTags([]);
    };

    return (
        <TagFilterContext.Provider
            value={{
                selectedTags,
                setSelectedTags,
                toggleTag,
                selectTag,
                clearTags,
            }}
        >
            {children}
        </TagFilterContext.Provider>
    );
}

export function useTagFilter() {
    const context = useContext(TagFilterContext);
    if (context === undefined) {
        throw new Error("useTagFilter must be used within a TagFilterProvider");
    }
    return context;
}
