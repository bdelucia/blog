"use client";

import { useEffect } from "react";
import { trackBlogPostView } from "@/lib/analytics";

interface BlogPostTrackerProps {
    postTitle: string;
    postSlug: string;
}

export function BlogPostTracker({ postTitle, postSlug }: BlogPostTrackerProps) {
    useEffect(() => {
        // Track blog post view
        trackBlogPostView(postTitle, postSlug);
    }, [postTitle, postSlug]);

    return null; // This component doesn't render anything
}
