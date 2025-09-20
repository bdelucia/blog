"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { CyanButton } from "@/components/magicui/cyan-button";
import { useState, useEffect } from "react";
import { ScrollProgress } from "../magicui/scroll-progress";
import { useAuthState } from "@/hooks/useAuthState";
import { useTheme } from "@/hooks/useTheme";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { signOutClient } from "@/lib/auth-client";
import { ProfileModal } from "./ProfileModal";
import { useUpdateProfile } from "@/hooks/useUserQuery";
import { MobileSidebar } from "./MobileSidebar";

interface HeaderProps {
    className?: string;
    title?: string;
    scrollProgress?: boolean;
    showSignIn?: boolean;
}

export function Header({
    className,
    title,
    scrollProgress,
    showSignIn = true,
}: HeaderProps) {
    const { theme, mounted: themeMounted } = useTheme();
    const { user, loading, initialized } = useAuthState();
    const updateProfileMutation = useUpdateProfile();
    const [mounted, setMounted] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check if screen width is less than 540px
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 540);
        };

        // Initial check
        checkIsMobile();

        // Add event listener for window resize
        window.addEventListener("resize", checkIsMobile);

        // Cleanup
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    const handleSignOut = async () => {
        try {
            await signOutClient();
            // The useAuth hook will automatically update the user state
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleProfileUpdate = async (data: {
        fullName: string;
        avatarUrl?: string | null;
    }) => {
        try {
            // This will instantly update the UI (optimistic update)
            // and then sync with the server
            await updateProfileMutation.mutateAsync(data);
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
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
                {/* Left section - Mobile sidebar or Desktop auth buttons */}
                {showSignIn ? (
                    <div className="w-20 flex justify-start">
                        {/* Mobile sidebar - shown on screens < 540px */}
                        {isMobile && <MobileSidebar showSignIn={showSignIn} />}

                        {/* Desktop auth buttons - shown on screens >= 540px */}
                        {!isMobile && (
                            <>
                                {!mounted ? (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                ) : !initialized || loading ? (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                ) : user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="hover:cursor-pointer focus:outline-none rounded-full">
                                                <Avatar
                                                    src={user.avatarUrl}
                                                    alt={
                                                        user.fullName ||
                                                        "User avatar"
                                                    }
                                                    size="md"
                                                />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-56"
                                            onCloseAutoFocus={(e) => {
                                                // Prevent the trigger from getting focus when dropdown closes
                                                e.preventDefault();
                                            }}
                                        >
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setIsProfileModalOpen(true)
                                                }
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Edit Profile</span>
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
                                    <div className="flex gap-2">
                                        <Link href="/auth/login">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="hover:cursor-pointer"
                                            >
                                                Sign In
                                            </Button>
                                        </Link>
                                        <Link href="/auth/signup">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="hover:cursor-pointer"
                                            >
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="w-20 flex justify-start"></div>
                )}

                {/* Center section - Home button */}
                <Link href="/">
                    {!themeMounted ? (
                        // Show a neutral button during SSR to prevent hydration mismatch
                        <Button
                            variant="outline"
                            className="text-lg font-semibold"
                        >
                            {title ?? "Bob with a Blog"}
                        </Button>
                    ) : theme === "dark" ? (
                        <RainbowButton className="text-lg font-semibold">
                            {title ?? "Bob with a Blog"}
                        </RainbowButton>
                    ) : (
                        <CyanButton className="text-lg font-semibold">
                            {title ?? "Bob with a Blog"}
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

            {/* Profile Modal */}
            {user && (
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    user={user}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </header>
    );
}
