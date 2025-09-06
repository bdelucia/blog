"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            const supabase = createClient();

            try {
                // Handle the OAuth callback
                const { data, error } = await supabase.auth.getSession();

                console.log("Auth callback - Session data:", data);
                console.log("Auth callback - Error:", error);

                if (error) {
                    console.error("Auth callback error:", error);
                    setError(error.message);
                    setTimeout(() => {
                        router.push("/auth/login?error=callback_error");
                    }, 3000);
                    return;
                }

                if (data.session) {
                    console.log(
                        "User authenticated successfully:",
                        data.session.user
                    );
                    console.log(
                        "User metadata:",
                        data.session.user.user_metadata
                    );
                    console.log(
                        "Avatar URL from Google:",
                        data.session.user.user_metadata?.avatar_url
                    );

                    // Check if this is a new user (Google OAuth signup)
                    // and create user record if needed
                    try {
                        const userData = {
                            userId: data.session.user.id,
                            email: data.session.user.email,
                            fullName:
                                data.session.user.user_metadata?.full_name ||
                                data.session.user.user_metadata?.name ||
                                data.session.user.user_metadata?.display_name,
                            avatarUrl:
                                data.session.user.user_metadata?.avatar_url,
                        };

                        console.log("Sending user data to API:", userData);

                        const response = await fetch("/api/auth/create-user", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(userData),
                        });

                        if (!response.ok) {
                            console.error(
                                "Failed to create user record, but continuing..."
                            );
                        } else {
                            console.log(
                                "User record created/updated successfully"
                            );
                        }
                    } catch (error) {
                        console.error("Error creating user record:", error);
                        // Don't block the flow if user creation fails
                    }

                    // User is authenticated, redirect to home or intended page
                    const urlParams = new URLSearchParams(
                        window.location.search
                    );
                    const redirectTo = urlParams.get("redirect_to") || "/";
                    console.log("Redirecting to:", redirectTo);
                    router.push(redirectTo);
                } else {
                    console.log("No session found, redirecting to login");
                    // No session found, redirect to login
                    router.push("/auth/login");
                }
            } catch (error) {
                console.error("Auth callback error:", error);
                setError(
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred"
                );
                setTimeout(() => {
                    router.push("/auth/login?error=callback_error");
                }, 3000);
            }
        };

        handleAuthCallback();
    }, [router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                        <svg
                            className="h-6 w-6 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-center text-xl font-semibold text-gray-900 dark:text-white">
                        Authentication Error
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {error}
                    </p>
                    <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-500">
                        Redirecting to login page...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Completing sign in...
                </p>
            </div>
        </div>
    );
}
