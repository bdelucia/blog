"use client";

import { LoadingSpinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { PostsDataTable } from "./PostsDataTable";

// Helper function to fetch all posts
async function fetchAllPosts() {
    const response = await fetch("/api/admin/posts");

    if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
}

export function AdminPostsView() {
    const {
        data: allPosts,
        isLoading,
        error,
        isFetching,
        isStale,
    } = useQuery({
        queryKey: ["admin-posts"],
        queryFn: fetchAllPosts,
        staleTime: 5 * 60 * 1000, // 5 minutes - increased for better caching
        gcTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
        retry: 1, // Reduced retries for faster fallback
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch if data exists
        refetchOnReconnect: false, // Don't refetch on reconnect
        // Add these for immediate rendering
        suspense: false, // Don't use suspense to avoid blocking
        placeholderData: (previousData) => previousData, // Keep previous data while loading
    });

    if (isLoading) {
        return (
            <>
                <AdminDashboardHeader />
                <div className="flex flex-1 flex-col relative z-10">
                    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                        <LoadingSpinner
                            text="Loading Posts..."
                            size="lg"
                            className="text-center"
                        />
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <AdminDashboardHeader />
                <div className="flex flex-1 flex-col relative z-10">
                    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                        <div className="text-center">
                            <p className="text-red-600 dark:text-red-400 mb-2">
                                Error loading posts
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!allPosts) {
        return (
            <>
                <AdminDashboardHeader />
                <div className="flex flex-1 flex-col relative z-10">
                    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                        <p className="text-gray-500">No posts data available</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminDashboardHeader />
            <div className="flex flex-1 flex-col relative z-10">
                <div className="px-4 lg:px-6">
                    <PostsDataTable data={allPosts} />
                </div>
            </div>
        </>
    );
}
