"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "motion/react";

interface TOCItem {
    id: string;
    title: string;
    level: number;
    children?: TOCItem[];
}

interface MobileTableOfContentsProps {
    content: string;
}

// Custom hook for exact breakpoint at 1768px
function useWindowSize() {
    const [windowSize, setWindowSize] = useState<{
        width: number | undefined;
        height: number | undefined;
    }>({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener("resize", handleResize);
        handleResize(); // Set initial value
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
}

export function MobileTableOfContents({ content }: MobileTableOfContentsProps) {
    const [tocItems, setTocItems] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const { width } = useWindowSize();
    const isLargeScreen = width && width > 1768;

    // Parse headers from content and build TOC structure
    useEffect(() => {
        if (!content) return;

        // Extract headers from the content
        const headerRegex = /^(#{1,6})\s+(.+)$/gm;
        const headers: TOCItem[] = [];
        let match;

        while ((match = headerRegex.exec(content)) !== null) {
            const level = match[1].length;
            const title = match[2].trim();
            const id = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");

            headers.push({
                id,
                title,
                level,
            });
        }

        // Build hierarchical structure
        const buildTOC = (items: TOCItem[]): TOCItem[] => {
            const result: TOCItem[] = [];
            const stack: TOCItem[] = [];

            for (const item of items) {
                // Pop items from stack that are at same or deeper level
                while (
                    stack.length > 0 &&
                    stack[stack.length - 1].level >= item.level
                ) {
                    stack.pop();
                }

                if (stack.length === 0) {
                    // Top level item
                    result.push(item);
                } else {
                    // Child item
                    const parent = stack[stack.length - 1];
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(item);
                }

                stack.push(item);
            }

            return result;
        };

        const builtTOC = buildTOC(headers);
        setTocItems(builtTOC);

        // Expand all H1 items by default
        const h1Ids = builtTOC
            .filter((item) => item.level === 1)
            .map((item) => item.id);
        setExpandedItems(new Set(h1Ids));
    }, [content]);

    // Handle scroll to update active section
    useEffect(() => {
        const handleScroll = () => {
            const headerElements = tocItems
                .flatMap((item) => [item, ...(item.children || [])])
                .map((item) => document.getElementById(item.id))
                .filter(Boolean);

            if (headerElements.length === 0) return;

            // Find the currently visible header
            let current = "";
            for (const element of headerElements) {
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100) {
                        // 100px offset from top
                        current = element.id;
                    }
                }
            }

            setActiveId(current);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Initial call

        return () => window.removeEventListener("scroll", handleScroll);
    }, [tocItems]);

    const scrollToHeader = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const headerHeight = 80; // Account for fixed header
            const elementPosition =
                element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    const toggleExpanded = (id: string) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const renderTOCItem = (item: TOCItem, depth = 0) => {
        const isActive = activeId === item.id;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.id);
        const isH1 = item.level === 1;

        return (
            <div key={item.id} className="mb-1">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => scrollToHeader(item.id)}
                        className={cn(
                            "flex-1 text-left py-2 px-3 rounded-md text-sm transition-colors cursor-pointer",
                            "bg-muted/50 hover:bg-accent hover:text-accent-foreground",
                            isActive
                                ? "bg-accent text-accent-foreground font-medium"
                                : "text-muted-foreground",
                            isH1 && "font-semibold text-foreground"
                        )}
                    >
                        {item.title}
                    </button>
                    {hasChildren && (
                        <button
                            onClick={() => toggleExpanded(item.id)}
                            className={cn(
                                "p-1 rounded-sm transition-colors cursor-pointer",
                                "hover:bg-gray-100 dark:hover:bg-gray-800",
                                "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            <motion.div
                                animate={{
                                    rotate: isExpanded ? 90 : 0,
                                }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeInOut",
                                }}
                            >
                                <ChevronRight className="h-3 w-3" />
                            </motion.div>
                        </button>
                    )}
                </div>
                <AnimatePresence>
                    {hasChildren && isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="mt-1 ml-6 overflow-hidden"
                        >
                            {item.children!.map((child) =>
                                renderTOCItem(child, depth + 1)
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // Only render on mobile/tablet screens
    if (isLargeScreen || tocItems.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-4 z-50 pointer-events-none">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 cursor-pointer pointer-events-auto"
                        size="icon"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="right"
                    className="w-80 [&>button]:cursor-pointer flex flex-col"
                >
                    <SheetHeader className="pb-4 border-b flex-shrink-0">
                        <SheetTitle>Table of Contents</SheetTitle>
                        <SheetDescription>
                            Navigate through the article sections
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 px-4 pb-8 flex-1 overflow-y-auto">
                        <nav className="space-y-1">
                            {tocItems.map((item) => renderTOCItem(item))}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
