"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Helper function to fetch all posts
async function fetchAllPosts() {
    const response = await fetch("/api/admin/posts");
    if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    return response.json();
}

// Helper function to fetch all users
async function fetchAllUsers() {
    const response = await fetch("/api/admin/users");
    if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    return response.json();
}

export function ImmediatePrefetcher() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Immediately start prefetching posts and users data
        // This runs as soon as the admin layout loads
        const prefetchPosts = queryClient.prefetchQuery({
            queryKey: ["admin-posts"],
            queryFn: fetchAllPosts,
            staleTime: 5 * 60 * 1000, // 5 minutes - match the component settings
            gcTime: 10 * 60 * 1000, // 10 minutes - match the component settings
        });

        const prefetchUsers = queryClient.prefetchQuery({
            queryKey: ["admin-users"],
            queryFn: fetchAllUsers,
            staleTime: 5 * 60 * 1000, // 5 minutes - match the component settings
            gcTime: 10 * 60 * 1000, // 10 minutes - match the component settings
        });

        // Don't await these - let them run in the background
        Promise.allSettled([prefetchPosts, prefetchUsers]).catch((error) => {
            console.error("Error prefetching admin data:", error);
        });
    }, [queryClient]);

    // This component doesn't render anything
    return null;
}
