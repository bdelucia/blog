"use client";

import { useQuery } from "@tanstack/react-query";

interface PageViewsDataPoint {
    date: string;
    pageViews: number;
}

interface PageViewsChartResponse {
    success: boolean;
    data: PageViewsDataPoint[];
    source: string;
}

async function fetchPageViewsChartData(
    days: number,
    viewType: "cumulative" | "daily"
): Promise<PageViewsDataPoint[]> {
    const response = await fetch(
        `/api/admin/page-views?days=${days}&viewType=${viewType}`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch page views chart data: ${response.statusText}`
        );
    }

    const result: PageViewsChartResponse = await response.json();

    if (!result.success) {
        throw new Error("Failed to fetch page views data");
    }

    return result.data;
}

export function usePageViewsChartData(
    days: number,
    viewType: "cumulative" | "daily"
) {
    return useQuery({
        queryKey: ["page-views-chart", days, viewType],
        queryFn: () => fetchPageViewsChartData(days, viewType),
        staleTime: 5 * 60 * 1000, // 5 minutes - GA4 data doesn't change frequently
        gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
        retry: 2,
        refetchOnWindowFocus: false,
    });
}
