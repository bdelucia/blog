"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Header } from "@/components/shared/Header";
import { useUpdateUserCache } from "@/hooks/useUserQuery";
import { Starfield } from "@/components/magicui/starfield";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const updateUserCache = useUpdateUserCache();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const supabase = createClient();

            try {
                // Debug: Log current URL and search params
                console.log("Current URL:", window.location.href);
                console.log("Search params:", window.location.search);
                console.log("Hash:", window.location.hash);

                // Handle the OAuth callback and email confirmation
                const { data, error } = await supabase.auth.getSession();

                console.log("Auth callback - Session data:", data);
                console.log("Auth callback - Error:", error);

                // If there's no session, try to get it from URL hash/fragment
                if (!data.session && !error) {
                    const { data: sessionData, error: sessionError } =
                        await supabase.auth.getSession();
                    if (sessionData.session) {
                        console.log(
                            "Session found after retry:",
                            sessionData.session
                        );
                    }
                }

                // Check for URL hash parameters (email confirmation errors)
                const urlHash = window.location.hash;
                if (
                    urlHash.includes("error=access_denied") &&
                    urlHash.includes("otp_expired")
                ) {
                    console.error("OTP expired error detected");
                    setError(
                        "The email confirmation link has expired. Please try signing up again or request a new confirmation email."
                    );
                    setTimeout(() => {
                        router.push("/auth/signup?error=otp_expired");
                    }, 5000);
                    return;
                }

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

                    // Check if this is a new user (Google OAuth signup or email confirmation)
                    // and create user record if needed
                    try {
                        // First check if user already exists in our database
                        const userCheckResponse = await fetch(
                            "/api/auth/get-user"
                        );

                        if (userCheckResponse.ok) {
                            // User exists in database - check if the email matches
                            const existingUserData =
                                await userCheckResponse.json();
                            console.log(
                                "User already exists in database:",
                                existingUserData.email
                            );
                            console.log(
                                "New session user email:",
                                data.session.user.email
                            );

                            // If the emails match, update with latest Google data
                            if (
                                existingUserData.email ===
                                data.session.user.email
                            ) {
                                console.log(
                                    "Same user - updating with latest Google data"
                                );

                                const updatedUserData = {
                                    userId: data.session.user.id,
                                    email: data.session.user.email,
                                    fullName:
                                        data.session.user.user_metadata
                                            ?.full_name ||
                                        data.session.user.user_metadata?.name ||
                                        data.session.user.user_metadata
                                            ?.display_name ||
                                        existingUserData.fullName,
                                    avatarUrl:
                                        data.session.user.user_metadata
                                            ?.avatar_url ||
                                        existingUserData.avatarUrl,
                                };

                                // Update the user record with latest Google data
                                const updateResponse = await fetch(
                                    "/api/auth/update-oauth-data",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(updatedUserData),
                                    }
                                );

                                if (updateResponse.ok) {
                                    const result = await updateResponse.json();
                                    console.log(
                                        "Updated user with Google data:",
                                        result.user
                                    );
                                    updateUserCache(result.user);
                                } else {
                                    console.log(
                                        "Failed to update user data, using existing data"
                                    );
                                    updateUserCache(existingUserData);
                                }
                            } else {
                                // Different user - this is a different Google account
                                console.log(
                                    "Different Google account detected - creating new user record"
                                );

                                // Create a new user record for this different Google account
                                const newUserData = {
                                    userId: data.session.user.id,
                                    email: data.session.user.email,
                                    fullName:
                                        data.session.user.user_metadata
                                            ?.full_name ||
                                        data.session.user.user_metadata?.name ||
                                        data.session.user.user_metadata
                                            ?.display_name ||
                                        "User",
                                    avatarUrl:
                                        data.session.user.user_metadata
                                            ?.avatar_url || null,
                                };

                                // Create the new user record
                                const createResponse = await fetch(
                                    "/api/auth/create-user",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(newUserData),
                                    }
                                );

                                if (createResponse.ok) {
                                    const result = await createResponse.json();
                                    console.log(
                                        "Created new user for different Google account:",
                                        result.user
                                    );
                                    updateUserCache(result.user);
                                } else {
                                    console.error(
                                        "Failed to create new user record"
                                    );
                                    updateUserCache(existingUserData);
                                }
                            }
                        } else {
                            // User doesn't exist - create new user record
                            const userData = {
                                userId: data.session.user.id,
                                email: data.session.user.email,
                                fullName:
                                    data.session.user.user_metadata
                                        ?.full_name ||
                                    data.session.user.user_metadata?.name ||
                                    data.session.user.user_metadata
                                        ?.display_name,
                                avatarUrl:
                                    data.session.user.user_metadata?.avatar_url,
                            };

                            console.log(
                                "Creating new user record with Google data:",
                                userData
                            );

                            const response = await fetch(
                                "/api/auth/create-user",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(userData),
                                }
                            );

                            if (!response.ok) {
                                const errorData = await response.json();
                                console.error(
                                    "Failed to create user record:",
                                    response.status,
                                    errorData
                                );
                                // Show error to user instead of silently continuing
                                setError(
                                    `Failed to create user account: ${errorData.error || "Unknown error"}. Please try again or contact support.`
                                );
                                return;
                            } else {
                                const result = await response.json();
                                console.log("User created successfully:", result);

                                // Update the cache with the new user data
                                if (result.user) {
                                    updateUserCache(result.user);
                                }
                            }
                        }
                    } catch (error) {
                        console.error(
                            "Error checking/creating user record:",
                            error
                        );
                        // Don't block the flow if user creation fails
                    }

                    // User is authenticated, redirect to home or intended page
                    const urlParams = new URLSearchParams(
                        window.location.search
                    );
                    const redirectTo = urlParams.get("redirect_to") || "/";
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
            <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <Starfield
                    starCount={150}
                    duration={25}
                    starColor="#ffffff"
                    starSize={[1, 4]}
                    className="dark:opacity-100 opacity-0"
                />
                <div className="absolute inset-0 pointer-events-none dark:hidden">
                    <FlickeringGrid
                        className="relative inset-0 z-0"
                        squareSize={4}
                        gridGap={6}
                        color="#60A5FA"
                        maxOpacity={0.3}
                        flickerChance={0.1}
                    />
                </div>
                <Header />
                <div className="relative z-10 text-center">
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
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
            <Starfield
                starCount={150}
                duration={25}
                starColor="#ffffff"
                starSize={[1, 4]}
                className="dark:opacity-100 opacity-0"
            />
            <div className="absolute inset-0 pointer-events-none dark:hidden">
                <FlickeringGrid
                    className="relative inset-0 z-0"
                    squareSize={4}
                    gridGap={6}
                    color="#60A5FA"
                    maxOpacity={0.3}
                    flickerChance={0.1}
                />
            </div>
            <Header />
            <div className="relative z-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Completing sign in...
                </p>
            </div>
        </div>
    );
}
