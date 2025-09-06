"use client";

import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { CyanButton } from "@/components/magicui/cyan-button";
import { useState, useEffect } from "react";
import { ScrollProgress } from "../magicui/scroll-progress";
import { useAuthState } from "@/hooks/useAuthState";
import { useTheme } from "@/hooks/useTheme";
import { NoSSR } from "./NoSSR";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { signOutClient } from "@/lib/auth-client";

interface HeaderProps {
    className?: string;
    title?: string;
    scrollProgress?: boolean;
}

export function Header({ className, title, scrollProgress }: HeaderProps) {
    const { theme, mounted: themeMounted } = useTheme();
    const { user, loading, initialized } = useAuthState();

    const handleSignOut = async () => {
        try {
            await signOutClient();
            // The useAuth hook will automatically update the user state
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <header
            className={cn(
                "fixed top-0 z-40 w-full h-16 bg-background backdrop-blur-sm border-b border-border",
                className
            )}
            style={{ height: "64px" }}
        >
            <div className="flex items-center justify-between h-full px-6">
                {/* Left section - Sign in button or Avatar */}
                <div className="w-20 flex justify-start">
                    <NoSSR
                        fallback={
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                        }
                    >
                        {!initialized || loading ? (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                        ) : user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                                        <Avatar
                                            src={user.avatarUrl}
                                            alt={user.fullName || "User avatar"}
                                            size="md"
                                        />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <DropdownMenuItem
                                        onClick={() => {
                                            /* TODO: Navigate to profile */
                                        }}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        <span>User Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        variant="destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/auth/signup">
                                <Button variant="outline" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </NoSSR>
                </div>

                {/* Center section - Home button */}
                <Link href="/">
                    {!themeMounted ? (
                        // Show a neutral button during SSR to prevent hydration mismatch
                        <Button
                            variant="outline"
                            className="text-lg font-semibold"
                        >
                            {title ?? "← Back to Home"}
                        </Button>
                    ) : theme === "dark" ? (
                        <RainbowButton className="text-lg font-semibold">
                            {title ?? "← Back to Home"}
                        </RainbowButton>
                    ) : (
                        <CyanButton className="text-lg font-semibold">
                            {title ?? "← Back to Home"}
                        </CyanButton>
                    )}
                </Link>

                {/* Right section */}
                <div className="w-20 flex justify-end">
                    <ModeToggle />
                </div>

                {scrollProgress && (
                    <div className="absolute bottom-0 left-0 right-0">
                        <ScrollProgress className="top-[63px]" />
                    </div>
                )}
            </div>
        </header>
    );
}
