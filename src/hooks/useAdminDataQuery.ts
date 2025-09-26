"use client";

import { useQuery } from "@tanstack/react-query";
import { Article } from "@/db/articles/functions";
import { User } from "@/db/users/functions";

interface AdminStats {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
    publishedPosts: number;
    totalPosts: number;
    draftPosts: number;
    weeklyUsersGained: number;
    weeklyUsers: User[];
}

interface AnalyticsSummary {
    uniqueVisitors: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
    uniqueVisitorsGrowth: number;
    weeklyVisitorsGained: number;
    weeklyPageViewsGained: number;
}

interface AdminData {
    stats: AdminStats;
    analytics: AnalyticsSummary;
    allUsers: any[];
    allPosts: Article[];
}

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

export function useAdminDataQuery() {
    // Fetch all data in parallel using React Query
    const statsQuery = useQuery({
        queryKey: ["admin-stats"],
        queryFn: fetchAdminStats,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
    });

    const analyticsQuery = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: fetchAdminAnalytics,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: 2,
        refetchOnWindowFocus: false,
    });

    const usersQuery = useQuery({
        queryKey: ["admin-users"],
        queryFn: fetchAllUsers,
        staleTime: 5 * 60 * 1000, // 5 minutes - increased for better caching
        gcTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
        retry: 1, // Reduced retries for faster fallback
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch if data exists
        refetchOnReconnect: false, // Don't refetch on reconnect
    });

    const postsQuery = useQuery({
        queryKey: ["admin-posts"],
        queryFn: fetchAllPosts,
        staleTime: 5 * 60 * 1000, // 5 minutes - increased for better caching
        gcTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
        retry: 1, // Reduced retries for faster fallback
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch if data exists
        refetchOnReconnect: false, // Don't refetch on reconnect
    });

    // Determine overall loading state
    const isLoading =
        statsQuery.isLoading ||
        analyticsQuery.isLoading ||
        usersQuery.isLoading ||
        postsQuery.isLoading;

    // Determine overall error state
    const error =
        statsQuery.error ||
        analyticsQuery.error ||
        usersQuery.error ||
        postsQuery.error;

    // Combine data when all queries are successful
    const data: AdminData | null =
        statsQuery.data &&
        analyticsQuery.data &&
        usersQuery.data &&
        postsQuery.data
            ? {
                  stats: statsQuery.data,
                  analytics: analyticsQuery.data,
                  allUsers: usersQuery.data,
                  allPosts: postsQuery.data,
              }
            : null;

    return {
        data,
        isLoading,
        error: error?.message || null,
        // Individual query states for more granular control
        statsQuery,
        analyticsQuery,
        usersQuery,
        postsQuery,
    };
}
