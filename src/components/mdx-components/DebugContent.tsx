"use client";

import { useEffect } from "react";

interface DebugContentProps {
    content: string;
}

export default function DebugContent({ content }: DebugContentProps) {
    useEffect(() => {
        console.log("=== DEBUG: Blog Post Content ===");
        console.log("Raw content:", content);
        console.log("Content length:", content.length);
        console.log("Contains 'sandpack':", content.includes("sandpack"));
        console.log("Contains 'Sandpack':", content.includes("Sandpack"));
        console.log("Contains '<Sandpack':", content.includes("<Sandpack"));
        console.log("Contains '```':", content.includes("```"));
        console.log("=== END DEBUG ===");
    }, [content]);

    return null; // This component doesn't render anything
}
