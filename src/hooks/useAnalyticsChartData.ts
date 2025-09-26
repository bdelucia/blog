"use client";

import { useQuery } from "@tanstack/react-query";

interface ChartDataPoint {
    date: string;
    desktop: number;
    mobile: number;
}

interface AnalyticsChartResponse {
    success: boolean;
    data: ChartDataPoint[];
    source: string;
}

async function fetchAnalyticsChartData(
    days: number,
    viewType: "cumulative" | "daily"
): Promise<ChartDataPoint[]> {
    const response = await fetch(
        `/api/admin/analytics-chart?days=${days}&viewType=${viewType}`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch analytics chart data: ${response.statusText}`
        );
    }

    const result: AnalyticsChartResponse = await response.json();

    if (!result.success) {
        throw new Error("Failed to fetch analytics data");
    }

    return result.data;
}

export function useAnalyticsChartData(
    days: number,
    viewType: "cumulative" | "daily"
) {
    return useQuery({
        queryKey: ["analytics-chart", days, viewType],
        queryFn: () => fetchAnalyticsChartData(days, viewType),
        staleTime: 5 * 60 * 1000, // 5 minutes - GA4 data doesn't change frequently
        gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
        retry: 2,
        refetchOnWindowFocus: false,
    });
}
