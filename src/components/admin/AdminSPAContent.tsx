"use client";

import { usePathname } from "next/navigation";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { DashboardNewPostForm } from "./DashboardNewPostForm";
import { DashboardEditPostForm } from "./DashboardEditPostForm";
import { PostsDataTable } from "./PostsDataTable";
import { UsersDataTable } from "./UsersDataTable";
import { useEffect, useState } from "react";
import { Article } from "@/db/articles/functions";
import { getPost } from "@/data/blog";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useAdminDashboard } from "@/components/providers/admin-dashboard-provider";

interface AdminSPAContentProps {
    stats: {
        totalUsers: number;
        adminUsers: number;
        regularUsers: number;
        publishedPosts: number;
        totalPosts: number;
        draftPosts: number;
        weeklyUsersGained: number;
        weeklyUsers: any[];
    };
    analytics: {
        uniqueVisitors: number;
        pageViews: number;
        sessions: number;
        bounceRate: number;
        uniqueVisitorsGrowth: number;
        weeklyVisitorsGained: number;
        weeklyPageViewsGained: number;
    };
    allUsers: any[];
    allPosts: Article[];
}

export function AdminSPAContent({
    stats,
    analytics,
    allUsers,
    allPosts,
}: AdminSPAContentProps) {
    const pathname = usePathname();
    const [editingPost, setEditingPost] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { currentView } = useAdminDashboard();

    // Extract slug from pathname for edit routes
    const getSlugFromPath = (path: string) => {
        const match = path.match(/\/admin\/posts\/edit-post\/(.+)$/);
        return match ? match[1] : null;
    };

    // Load post data when on edit route
    useEffect(() => {
        const slug = getSlugFromPath(pathname);
        if (slug && pathname.startsWith("/admin/posts/edit-post/")) {
            setIsLoading(true);

            // First try to find the post in allPosts
            const existingPost = allPosts.find((p) => p.slug === slug);
            if (existingPost) {
                setEditingPost(existingPost);
                setIsLoading(false);
            } else {
                // If not found in allPosts, fetch from API
                const fetchPost = async () => {
                    try {
                        const response = await fetch(
                            `/api/admin/get-post/${slug}`
                        );
                        if (response.ok) {
                            const post = await response.json();
                            setEditingPost(post);
                        }
                    } catch (error) {
                        console.error("Error fetching post:", error);
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchPost();
            }
        } else {
            setEditingPost(null);
        }
    }, [pathname, allPosts]);

    const renderContent = () => {
        // Handle SPA views first
        if (currentView === "posts") {
            return (
                <>
                    <AdminDashboardHeader />
                    <div className="flex flex-1 flex-col relative z-10">
                        <div className="px-4 lg:px-6">
                            {allPosts ? (
                                <PostsDataTable data={allPosts} />
                            ) : (
                                <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                                    <LoadingSpinner
                                        text="Loading Posts..."
                                        size="lg"
                                        className="text-center"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </>
            );
        }

        if (currentView === "users") {
            return (
                <>
                    <AdminDashboardHeader />
                    <div className="flex flex-1 flex-col relative z-10">
                        <div className="px-4 lg:px-6">
                            {allUsers ? (
                                <UsersDataTable data={allUsers} />
                            ) : (
                                <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                                    <LoadingSpinner
                                        text="Loading Users..."
                                        size="lg"
                                        className="text-center"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </>
            );
        }

        if (pathname === "/admin" || currentView === "overview") {
            return (
                <>
                    <AdminDashboardHeader />
                    <div className="flex flex-1 flex-col relative z-10">
                        <AdminDashboardClient
                            stats={stats}
                            analytics={analytics}
                            allUsers={allUsers}
                            allPosts={allPosts}
                        />
                    </div>
                </>
            );
        }

        if (pathname === "/admin/posts/create-post") {
            return (
                <>
                    <AdminDashboardHeader />
                    <div className="flex flex-1 flex-col relative z-10">
                        <div className="px-4 lg:px-6">
                            <DashboardNewPostForm />
                        </div>
                    </div>
                </>
            );
        }

        if (pathname.startsWith("/admin/posts/edit-post/")) {
            const slug = getSlugFromPath(pathname);
            if (!slug) {
                return (
                    <>
                        <AdminDashboardHeader />
                        <div className="flex flex-1 flex-col relative z-10">
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">Post not found</p>
                            </div>
                        </div>
                    </>
                );
            }

            if (isLoading) {
                return (
                    <>
                        <AdminDashboardHeader />
                        <div className="flex flex-1 flex-col relative z-10">
                            <div className="flex items-center justify-center h-full">
                                <LoadingSpinner
                                    text="Loading post..."
                                    size="lg"
                                />
                            </div>
                        </div>
                    </>
                );
            }

            if (!editingPost) {
                return (
                    <>
                        <AdminDashboardHeader />
                        <div className="flex flex-1 flex-col relative z-10">
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">Post not found</p>
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
                            <DashboardEditPostForm post={editingPost} />
                        </div>
                    </div>
                </>
            );
        }

        // Default fallback
        return (
            <>
                <AdminDashboardHeader />
                <div className="flex flex-1 flex-col relative z-10">
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Page not found</p>
                    </div>
                </div>
            </>
        );
    };

    return <>{renderContent()}</>;
}
