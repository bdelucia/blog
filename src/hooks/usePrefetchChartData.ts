"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAnalyticsChartData } from "./useAnalyticsChartData";
import { usePageViewsChartData } from "./usePageViewsChartData";

// Helper function to fetch analytics chart data
async function fetchAnalyticsChartData(
    days: number,
    viewType: "cumulative" | "daily"
) {
    const response = await fetch(
        `/api/admin/analytics-chart?days=${days}&viewType=${viewType}`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch analytics chart data: ${response.statusText}`
        );
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error("Failed to fetch analytics data");
    }

    return result.data;
}

// Helper function to fetch page views chart data
async function fetchPageViewsChartData(
    days: number,
    viewType: "cumulative" | "daily"
) {
    const response = await fetch(
        `/api/admin/page-views?days=${days}&viewType=${viewType}`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch page views chart data: ${response.statusText}`
        );
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error("Failed to fetch page views data");
    }

    return result.data;
}

export function usePrefetchChartData() {
    const queryClient = useQueryClient();

    const prefetchAllChartData = async () => {
        const timeRanges = [7, 30, 90];
        const viewTypes: ("cumulative" | "daily")[] = ["cumulative", "daily"];

        // Priority prefetch: Most commonly used combinations first (30 days, both views)
        const priorityPrefetchPromises: Promise<void>[] = [];

        // Prefetch 30-day data first (most common default)
        for (const viewType of viewTypes) {
            priorityPrefetchPromises.push(
                queryClient.prefetchQuery({
                    queryKey: ["analytics-chart", 30, viewType],
                    queryFn: () => fetchAnalyticsChartData(30, viewType),
                    staleTime: 5 * 60 * 1000,
                    gcTime: 30 * 60 * 1000,
                })
            );

            priorityPrefetchPromises.push(
                queryClient.prefetchQuery({
                    queryKey: ["page-views-chart", 30, viewType],
                    queryFn: () => fetchPageViewsChartData(30, viewType),
                    staleTime: 5 * 60 * 1000,
                    gcTime: 30 * 60 * 1000,
                })
            );
        }

        // Execute priority prefetch first
        try {
            await Promise.allSettled(priorityPrefetchPromises);
            console.log("Priority chart data prefetching completed");
        } catch (error) {
            console.error("Error prefetching priority chart data:", error);
        }

        // Background prefetch: Remaining combinations
        const backgroundPrefetchPromises: Promise<void>[] = [];

        for (const days of timeRanges) {
            if (days === 30) continue; // Skip 30 days as it's already prefetched

            for (const viewType of viewTypes) {
                backgroundPrefetchPromises.push(
                    queryClient.prefetchQuery({
                        queryKey: ["analytics-chart", days, viewType],
                        queryFn: () => fetchAnalyticsChartData(days, viewType),
                        staleTime: 5 * 60 * 1000,
                        gcTime: 30 * 60 * 1000,
                    })
                );

                backgroundPrefetchPromises.push(
                    queryClient.prefetchQuery({
                        queryKey: ["page-views-chart", days, viewType],
                        queryFn: () => fetchPageViewsChartData(days, viewType),
                        staleTime: 5 * 60 * 1000,
                        gcTime: 30 * 60 * 1000,
                    })
                );
            }
        }

        // Execute background prefetch (don't await to avoid blocking)
        Promise.allSettled(backgroundPrefetchPromises)
            .then(() => {
                console.log("Background chart data prefetching completed");
            })
            .catch((error) => {
                console.error(
                    "Error prefetching background chart data:",
                    error
                );
            });
    };

    return { prefetchAllChartData };
}
