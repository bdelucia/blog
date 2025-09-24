"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { type Article } from "@/data/blog-client";

type ViewType = "overview" | "create-post" | "edit-post";

interface AdminDashboardContextType {
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
    editingPost: Article | null;
    setEditingPost: (post: Article | null) => void;
    openCreatePost: () => void;
    openEditPost: (post: Article) => void;
    closeForms: () => void;
}

const AdminDashboardContext = createContext<
    AdminDashboardContextType | undefined
>(undefined);

export function AdminDashboardProvider({ children }: { children: ReactNode }) {
    const [currentView, setCurrentView] = useState<ViewType>("overview");
    const [editingPost, setEditingPost] = useState<Article | null>(null);

    const openCreatePost = () => {
        setCurrentView("create-post");
        setEditingPost(null);
    };

    const openEditPost = (post: Article) => {
        setEditingPost(post);
        setCurrentView("edit-post");
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
