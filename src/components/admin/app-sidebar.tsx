"use client";

import * as React from "react";
import {
    IconCamera,
    IconChartBar,
    IconDashboard,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
    IconFileWord,
    IconFolder,
    IconHelp,
    IconHome,
    IconInnerShadowTop,
    IconListDetails,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/admin/nav-main";
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppSidebarProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/admin",
            icon: IconDashboard,
        },
        {
            title: "Posts",
            url: "/admin/posts",
            icon: IconFileDescription,
        },
        {
            title: "Users",
            url: "/admin/users",
            icon: IconUsers,
        },
    ],
    documents: [
        {
            name: "Data Library",
            url: "#",
            icon: IconDatabase,
        },
        {
            name: "Reports",
            url: "#",
            icon: IconReport,
        },
        {
            name: "Word Assistant",
            url: "#",
            icon: IconFileWord,
        },
    ],
};

export function AppSidebar({
    user,
    ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
    const { theme, mounted: themeMounted } = useTheme();

    // Default user data if not provided
    const defaultUser = {
        name: "User",
        email: "user@example.com",
        avatar: undefined,
    };

    const userData = user || defaultUser;

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex flex-col gap-3 px-2 group-data-[collapsible=icon]:items-center">
                    {/* Bob with a Blog Button */}
                    <Link href="/" className="w-full">
                        {!themeMounted ? (
                            <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                        ) : theme === "dark" ? (
                            <RainbowButton className="w-full text-lg font-semibold group-data-[collapsible=icon]:hidden">
                                Bob with a Blog
                            </RainbowButton>
                        ) : (
                            <CyanButton className="w-full text-lg font-semibold group-data-[collapsible=icon]:hidden">
                                Bob with a Blog
                            </CyanButton>
                        )}
                    </Link>

                    {/* Home Icon for Collapsed State */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/"
                                className="group-data-[collapsible=icon]:block hidden"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent">
                                    <IconHome className="w-4 h-4" />
                                </div>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Go to Home</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
        </Sidebar>
    );
}
