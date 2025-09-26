"use client";

import { LoadingSpinner } from "@/components/ui/spinner";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { PostsDataTable } from "./PostsDataTable";

export function AdminPostsView() {
    const { data, isLoading, error } = useAdminData();

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

    if (!data) {
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
                    <PostsDataTable data={data.allPosts} />
                </div>
            </div>
        </>
    );
}
