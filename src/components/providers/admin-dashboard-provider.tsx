"use client";

import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { type Article } from "@/data/blog-client";
import { usePrefetchAdminData } from "@/hooks/usePrefetchAdminData";
import { usePrefetchChartData } from "@/hooks/usePrefetchChartData";

type ViewType = "overview" | "create-post" | "edit-post" | "posts" | "users";

interface AdminDashboardContextType {
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
    editingPost: Article | null;
    setEditingPost: (post: Article | null) => void;
    openCreatePost: () => void;
    openEditPost: (post: Article) => void;
    openPostsView: () => void;
    openUsersView: () => void;
    openOverview: () => void;
    closeForms: () => void;
}

const AdminDashboardContext = createContext<
    AdminDashboardContextType | undefined
>(undefined);

export function AdminDashboardProvider({ children }: { children: ReactNode }) {
    const [currentView, setCurrentView] = useState<ViewType>("overview");
    const [editingPost, setEditingPost] = useState<Article | null>(null);
    const { prefetchAllAdminData } = usePrefetchAdminData();
    const { prefetchAllChartData } = usePrefetchChartData();

    // Prefetch all admin data and chart data when the provider mounts
    useEffect(() => {
        // Start prefetching immediately - don't wait for anything
        const startPrefetching = async () => {
            // Prefetch admin data first (posts, users, stats, analytics)
            await prefetchAllAdminData();

            // Then prefetch chart data
            await prefetchAllChartData();
        };

        // Start prefetching immediately
        startPrefetching().catch((error) => {
            console.error("Error in prefetching:", error);
        });
    }, [prefetchAllAdminData, prefetchAllChartData]);

    const openCreatePost = () => {
        setCurrentView("create-post");
        setEditingPost(null);
    };

    const openEditPost = (post: Article) => {
        setEditingPost(post);
        setCurrentView("edit-post");
    };

    const openPostsView = () => {
        setCurrentView("posts");
        setEditingPost(null);
    };

    const openUsersView = () => {
        setCurrentView("users");
        setEditingPost(null);
    };

    const openOverview = () => {
        setCurrentView("overview");
        setEditingPost(null);
    };

    const closeForms = () => {
        setCurrentView("overview");
        setEditingPost(null);
    };

    return (
        <AdminDashboardContext.Provider
            value={{
                currentView,
                setCurrentView,
                editingPost,
                setEditingPost,
                openCreatePost,
                openEditPost,
                openPostsView,
                openUsersView,
                openOverview,
                closeForms,
            }}
        >
            {children}
        </AdminDashboardContext.Provider>
    );
}

export function useAdminDashboard() {
    const context = useContext(AdminDashboardContext);
    if (context === undefined) {
        throw new Error(
            "useAdminDashboard must be used within an AdminDashboardProvider"
        );
    }
    return context;
}
