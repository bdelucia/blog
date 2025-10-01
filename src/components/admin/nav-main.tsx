"use client";

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";
import Link from "next/link";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAdminDashboard } from "@/components/providers/admin-dashboard-provider";

// Helper function to fetch all posts
async function fetchAllPosts() {
    const response = await fetch("/api/admin/posts");
    if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    return response.json();
}

// Helper function to fetch all users
async function fetchAllUsers() {
    const response = await fetch("/api/admin/users");
    if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    return response.json();
}

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: Icon;
    }[];
}) {
    const { openCreatePost } = useAdminDashboard();
    const queryClient = useQueryClient();
    const pathname = usePathname();

    // Prefetch data on hover
    const handleMouseEnter = (url: string) => {
        if (url === "/admin/posts") {
            queryClient.prefetchQuery({
                queryKey: ["admin-posts"],
                queryFn: fetchAllPosts,
                staleTime: 5 * 60 * 1000, // 5 minutes - match component settings
                gcTime: 10 * 60 * 1000, // 10 minutes - match component settings
            });
        } else if (url === "/admin/users") {
            queryClient.prefetchQuery({
                queryKey: ["admin-users"],
                queryFn: fetchAllUsers,
                staleTime: 5 * 60 * 1000, // 5 minutes - match component settings
                gcTime: 10 * 60 * 1000, // 10 minutes - match component settings
            });
        }
    };

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => {
                                openCreatePost();
                                window.history.pushState(
                                    null,
                                    "",
                                    "/admin/posts/create-post"
                                );
                            }}
                            tooltip="Quick Create"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear cursor-pointer"
                        >
                            <IconCirclePlusFilled />
                            <span>Quick Create</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={`cursor-pointer ${
                                    pathname === item.url ? "bg-accent" : ""
                                }`}
                                onMouseEnter={() => handleMouseEnter(item.url)}
                            >
                                <Link href={item.url} prefetch={true}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
