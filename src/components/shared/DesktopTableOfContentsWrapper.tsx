"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { TableOfContents } from "./TableOfContents";

interface DesktopTableOfContentsWrapperProps {
    content: string;
    className?: string;
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

export function DesktopTableOfContentsWrapper({
    content,
    className,
}: DesktopTableOfContentsWrapperProps) {
    const { width } = useWindowSize();
    const isLargeScreen = width && width > 1768;

    // Only render the aside element on large screens
    if (!isLargeScreen) {
        return null;
    }

    return (
        <aside
            className={cn(
                "hidden lg:block flex-shrink-0 self-start",
                className
            )}
        >
            <TableOfContents content={content} />
        </aside>
    );
}
