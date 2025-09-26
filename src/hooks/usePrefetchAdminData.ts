"use client";

import { useQueryClient } from "@tanstack/react-query";

// Helper function to fetch admin stats
async function fetchAdminStats() {
    const response = await fetch("/api/admin/stats");

    if (!response.ok) {
        throw new Error(`Failed to fetch admin stats: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
}

// Helper function to fetch admin analytics
async function fetchAdminAnalytics() {
    const response = await fetch("/api/admin/analytics");

    if (!response.ok) {
        throw new Error(
            `Failed to fetch admin analytics: ${response.statusText}`
        );
    }

    const result = await response.json();
    return result;
}

// Helper function to fetch all users
async function fetchAllUsers() {
    const response = await fetch("/api/admin/users");

    if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
}

// Helper function to fetch all posts
async function fetchAllPosts() {
    const response = await fetch("/api/admin/posts");

    if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
}

export function usePrefetchAdminData() {
    const queryClient = useQueryClient();

    const prefetchAllAdminData = async () => {
        // Prefetch all admin data in parallel
        const prefetchPromises = [
            queryClient.prefetchQuery({
                queryKey: ["admin-stats"],
                queryFn: fetchAdminStats,
                staleTime: 2 * 60 * 1000, // 2 minutes - stats change moderately
                gcTime: 10 * 60 * 1000, // 10 minutes
            }),
            queryClient.prefetchQuery({
                queryKey: ["admin-analytics"],
                queryFn: fetchAdminAnalytics,
                staleTime: 5 * 60 * 1000, // 5 minutes - analytics change less frequently
                gcTime: 15 * 60 * 1000, // 15 minutes
            }),
            queryClient.prefetchQuery({
                queryKey: ["admin-users"],
                queryFn: fetchAllUsers,
                staleTime: 5 * 60 * 1000, // 5 minutes - increased for better caching
                gcTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
            }),
            queryClient.prefetchQuery({
                queryKey: ["admin-posts"],
                queryFn: fetchAllPosts,
                staleTime: 5 * 60 * 1000, // 5 minutes - increased for better caching
                gcTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
            }),
        ];

        try {
            await Promise.allSettled(prefetchPromises);
        } catch (error) {
            console.error("Error prefetching admin data:", error);
        }
    };

    return { prefetchAllAdminData };
}
