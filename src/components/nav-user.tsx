"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import * as React from "react";

export function NavUser({
    user,
}: {
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
}) {
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
        // Check if dark mode is enabled
        const isDarkMode = document.documentElement.classList.contains("dark");
        setIsDark(isDarkMode);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);

        if (newTheme) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        className="cursor-default group-data-[collapsible=icon]:ml-0 -ml-2"
                    >
                        <Avatar className="h-8 w-8 rounded-lg">
                            {user.avatar && (
                                <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                />
                            )}
                            <AvatarFallback className="rounded-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                                {user.name}
                            </span>
                            <span className="text-muted-foreground truncate text-xs">
                                {user.email}
                            </span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={toggleTheme}
                        tooltip={isDark ? "Switch to Light" : "Switch to Dark"}
                        className="cursor-pointer"
                    >
                        {isDark ? (
                            <Moon className="h-4 w-4" />
                        ) : (
                            <Sun className="h-4 w-4" />
                        )}
                        <span>{isDark ? "Dark" : "Light"}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </>
    );
}
