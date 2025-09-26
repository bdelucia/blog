"use client";

import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useAdminData } from "@/hooks/useAdminData";
import { usePrefetchChartData } from "@/hooks/usePrefetchChartData";
import { AdminSPAContent } from "./AdminSPAContent";

export function AdminLoadingWrapper() {
    const { data, isLoading, error } = useAdminData();
    const { prefetchAllChartData } = usePrefetchChartData();

    // Prefetch all chart data combinations on component mount
    useEffect(() => {
        prefetchAllChartData();
    }, [prefetchAllChartData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
                <LoadingSpinner
                    text="Loading Admin Dashboard..."
                    size="lg"
                    className="text-center"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-2">
                        Error loading admin dashboard
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    return (
        <AdminSPAContent
            stats={data.stats}
            analytics={data.analytics}
            allUsers={data.allUsers}
            allPosts={data.allPosts}
        />
    );
}
