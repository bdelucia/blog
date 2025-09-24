"use client";

import { usePathname } from "next/navigation";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { DashboardNewPostForm } from "./DashboardNewPostForm";
import { DashboardEditPostForm } from "./DashboardEditPostForm";
import { useEffect, useState } from "react";
import { Article } from "@/db/articles/functions";
import { getPost } from "@/data/blog";

interface AdminSPAContentProps {
    stats: {
        totalUsers: number;
        adminUsers: number;
        regularUsers: number;
        publishedPosts: number;
        totalPosts: number;
        draftPosts: number;
    };
    analytics: {
        uniqueVisitors: number;
        pageViews: number;
        sessions: number;
        bounceRate: number;
        uniqueVisitorsGrowth: number;
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
        if (pathname === "/admin") {
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
                                <p className="text-gray-500">Loading...</p>
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
