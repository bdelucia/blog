"use client";

import * as React from "react";
import {
    IconDashboard,
    IconFileText,
    IconUsers,
    IconEye,
    IconSettings,
    IconHome,
    IconCirclePlusFilled,
} from "@tabler/icons-react";

import { NavUser } from "@/components/admin/nav-user";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { CyanButton } from "@/components/magicui/cyan-button";
import { useTheme } from "@/hooks/useTheme";
import Link from "next/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
}

export function AdminSidebar({
    user,
    ...props
}: AdminSidebarProps & React.ComponentProps<typeof Sidebar>) {
    const { theme, mounted: themeMounted } = useTheme();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="px-2">
                    {/* Bob with a Blog Button */}
                    <Link href="/" className="w-full">
                        {!themeMounted ? (
                            <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                        ) : theme === "dark" ? (
                            <RainbowButton className="w-full text-lg font-semibold group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:mr-auto">
                                <span className="group-data-[collapsible=icon]:hidden">
                                    Bob with a Blog
                                </span>
                                <IconHome className="group-data-[collapsible=icon]:block hidden" />
                            </RainbowButton>
                        ) : (
                            <CyanButton className="w-full text-lg font-semibold group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:mr-auto">
                                <span className="group-data-[collapsible=icon]:hidden">
                                    Bob with a Blog
                                </span>
                                <IconHome className="group-data-[collapsible=icon]:block hidden" />
                            </CyanButton>
                        )}
                    </Link>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <div className="flex flex-col gap-2 group-data-[collapsible=icon]:pl-1">
                    {/* Quick Create Button */}
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip="Quick Create"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground cursor-pointer group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-1"
                            >
                                <Link href="/admin/posts/create-post">
                                    <IconCirclePlusFilled />
                                    <span>Quick Create</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>

                    {/* Dashboard Button */}
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip="Dashboard"
                                className="cursor-pointer group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-1"
                            >
                                <Link href="/admin">
                                    <IconDashboard />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>

                    {/* Posts Button */}
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Posts"
                                className="cursor-pointer group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-1"
                                onClick={() => {
                                    const postsSection =
                                        document.getElementById(
                                            "posts-section"
                                        );
                                    if (postsSection) {
                                        postsSection.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                    }
                                }}
                            >
                                <IconFileText />
                                <span>Posts</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>

                    {/* Users Button */}
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Users"
                                className="cursor-pointer group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-1"
                                onClick={() => {
                                    const usersSection =
                                        document.getElementById(
                                            "users-section"
                                        );
                                    if (usersSection) {
                                        usersSection.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                    }
                                }}
                            >
                                <IconUsers />
                                <span>Users</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
