"use client";

import { useQuery } from "@tanstack/react-query";

interface UsersDataPoint {
    date: string;
    users: number;
}

interface UsersChartResponse {
    success: boolean;
    data: UsersDataPoint[];
    source: string;
}

async function fetchUsersChartData(
    days: number,
    viewType: "cumulative" | "daily"
): Promise<UsersDataPoint[]> {
    const response = await fetch(
        `/api/admin/users-chart?days=${days}&viewType=${viewType}`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch users chart data: ${response.statusText}`
        );
    }

    const result: UsersChartResponse = await response.json();

    if (!result.success) {
        throw new Error("Failed to fetch users data");
    }

    return result.data;
}

export function useUsersChartData(
    days: number,
    viewType: "cumulative" | "daily"
) {
    return useQuery({
        queryKey: ["users-chart", days, viewType],
        queryFn: () => fetchUsersChartData(days, viewType),
        staleTime: 2 * 60 * 1000, // 2 minutes - user data changes more frequently
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
    });
}
