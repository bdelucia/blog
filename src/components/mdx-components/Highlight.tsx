"use client";

interface HighlightProps {
    children: React.ReactNode;
}

export default function Highlight({ children }: HighlightProps) {
    return (
        <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
            {children}
        </mark>
    );
}
