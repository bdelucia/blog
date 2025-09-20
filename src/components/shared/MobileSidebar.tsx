"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, LogIn, UserPlus, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { useAuthState } from "@/hooks/useAuthState";
import { Avatar } from "./Avatar";
import { signOutClient } from "@/lib/auth-client";
import { ProfileModal } from "./ProfileModal";
import { useUpdateProfile } from "@/hooks/useUserQuery";

interface MobileSidebarProps {
    showSignIn?: boolean;
}

export function MobileSidebar({ showSignIn = true }: MobileSidebarProps) {
    const { user, loading, initialized } = useAuthState();
    const updateProfileMutation = useUpdateProfile();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOutClient();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleProfileUpdate = async (data: {
        fullName: string;
        avatarUrl?: string | null;
    }) => {
        try {
            await updateProfileMutation.mutateAsync(data);
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    if (!showSignIn) {
        return null;
    }

    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden p-2"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="flex flex-col space-y-4 justify-center items-center h-full">
                        {!initialized || loading ? (
                            <div className="flex items-center space-x-3 p-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                                </div>
                            </div>
                        ) : user ? (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                    <Avatar
                                        src={user.avatarUrl}
                                        alt={user.fullName || "User avatar"}
                                        size="md"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">
                                            {user.fullName || "User"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setIsProfileModalOpen(true)}
                                    className="w-4/5 justify-center !px-10 py-3"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>

                                <Button
                                    variant="destructive"
                                    onClick={handleSignOut}
                                    className="w-4/5 justify-center !px-10 py-3"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link href="/auth/login" className="flex">
                                    <Button
                                        variant="outline"
                                        className="justify-center !px-10 py-3"
                                    >
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/auth/signup" className="flex">
                                    <Button
                                        variant="default"
                                        className="justify-center !px-10 py-3"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Profile Modal */}
            {user && (
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    user={user}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </>
    );
}
