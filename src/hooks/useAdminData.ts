"use client";

import { useState, useEffect } from "react";
import { Article } from "@/db/articles/functions";

interface AdminStats {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
    publishedPosts: number;
    totalPosts: number;
    draftPosts: number;
}

interface AnalyticsSummary {
    uniqueVisitors: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
    uniqueVisitorsGrowth: number;
}

interface AdminData {
    stats: AdminStats;
    analytics: AnalyticsSummary;
    allUsers: any[];
    allPosts: Article[];
}

export function useAdminData() {
    const [data, setData] = useState<AdminData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch all data in parallel
                const [
                    statsResponse,
                    analyticsResponse,
                    usersResponse,
                    postsResponse,
                ] = await Promise.all([
                    fetch("/api/admin/stats"),
                    fetch("/api/admin/analytics"),
                    fetch("/api/admin/users"),
                    fetch("/api/admin/posts"),
                ]);

                if (
                    !statsResponse.ok ||
                    !analyticsResponse.ok ||
                    !usersResponse.ok ||
                    !postsResponse.ok
                ) {
                    throw new Error("Failed to fetch admin data");
                }

                const [stats, analytics, allUsers, allPosts] =
                    await Promise.all([
                        statsResponse.json(),
                        analyticsResponse.json(),
                        usersResponse.json(),
                        postsResponse.json(),
                    ]);

                setData({
                    stats,
                    analytics,
                    allUsers,
                    allPosts,
                });
            } catch (err) {
                console.error("Error fetching admin data:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    return { data, isLoading, error };
}
