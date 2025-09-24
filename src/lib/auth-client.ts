import { createClient } from "@/utils/supabase/client";

// Auth types
export interface SignUpData {
    email: string;
    password: string;
    fullName?: string;
}

export interface SignInData {
    email: string;
    password: string;
}

// Client-side auth functions only
export function getClientAuth() {
    return createClient();
}

export async function signUpClient(signUpData: SignUpData) {
    const supabase = getClientAuth();

    // Use dynamic URL based on environment
    const baseUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
            emailRedirectTo: `${baseUrl}/auth/callback`,
            data: {
                full_name: signUpData.fullName,
            },
        },
    });

    if (authError) {
        throw new Error(authError.message);
    }

    // Create user record in our database after successful signup
    if (authData.user) {
        try {
            const response = await fetch("/api/auth/create-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: authData.user.id,
                    email: authData.user.email,
                    fullName: signUpData.fullName,
                }),
            });

            if (!response.ok) {
                console.error("Failed to create user record");
                // Don't throw here as the auth user was created successfully
            } else {
                // User record created successfully
                // Note: Cache will be updated when user data is fetched next time
            }
        } catch (error) {
            console.error("Error creating user record:", error);
            // Don't throw here as the auth user was created successfully
        }
    }

    return authData;
}

export async function signInClient(signInData: SignInData) {
    const supabase = getClientAuth();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
    });

    if (error) {
        throw new Error(error.message);
    }

    // Ensure session is properly stored with longer duration
    if (data.session) {
        console.log(
            "User signed in successfully, session expires at:",
            new Date(data.session.expires_at! * 1000)
        );
    }

    return data;
}

export async function signOutClient() {
    const supabase = getClientAuth();

    // Clear all Supabase session data from localStorage
    try {
        if (typeof window !== "undefined") {
            // Clear all Supabase-related localStorage keys
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("sb-")) {
                    keysToRemove.push(key);
                }
            }

            // Remove all Supabase keys
            keysToRemove.forEach((key) => localStorage.removeItem(key));

            // Clear any other cached user data
            localStorage.removeItem("user");
            sessionStorage.clear();

            console.log("Cleared all Supabase session data from localStorage");
        }
    } catch (error) {
        console.warn("Error clearing storage:", error);
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Supabase sign out error:", error);
        // Even if Supabase sign out fails, we still want to clear local data
    }

    // Force a hard reload to ensure all cached data is cleared
    if (typeof window !== "undefined") {
        // Clear all cookies related to Supabase
        document.cookie.split(";").forEach(function (c) {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(
                    /=.*/,
                    "=;expires=" + new Date().toUTCString() + ";path=/"
                );
        });

        // Clear any Google OAuth state from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        url.searchParams.delete("error");
        url.searchParams.delete("error_description");

        // Force a hard reload to a clean URL
        window.location.href = "/";
    }
}

export async function resetPasswordClient(email: string) {
    const supabase = getClientAuth();

    // Use dynamic URL based on environment
    const baseUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/reset-password`,
    });

    if (error) {
        throw new Error(error.message);
    }
}

export async function signInWithGoogle() {
    const supabase = getClientAuth();

    // Use dynamic URL based on environment
    const baseUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const redirectUrl = `${baseUrl}/auth/callback`;

    console.log("Google OAuth redirect URL:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: redirectUrl,
            queryParams: {
                // Force Google to show account selection screen
                prompt: "select_account",
                // Add a random parameter to prevent caching
                nonce: Math.random().toString(36).substring(7),
            },
        },
    });

    if (error) {
        console.error("Google OAuth error:", error);
        throw new Error(error.message);
    }

    return data;
}

export async function signUpWithGoogle() {
    const supabase = getClientAuth();

    // Use dynamic URL based on environment
    const baseUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const redirectUrl = `${baseUrl}/auth/callback`;

    console.log("Google OAuth redirect URL:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: redirectUrl,
            queryParams: {
                // Force Google to show account selection screen
                prompt: "select_account",
                // Add a random parameter to prevent caching
                nonce: Math.random().toString(36).substring(7),
            },
        },
    });

    if (error) {
        console.error("Google OAuth error:", error);
        throw new Error(error.message);
    }

    return data;
}

// Utility function to completely clear all authentication data
export function clearAllAuthData() {
    if (typeof window === "undefined") return;

    try {
        // Clear all Supabase localStorage keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("sb-")) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // Clear any other cached user data
        localStorage.removeItem("user");
        sessionStorage.clear();

        // Clear all cookies
        document.cookie.split(";").forEach(function (c) {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(
                    /=.*/,
                    "=;expires=" + new Date().toUTCString() + ";path=/"
                );
        });

        console.log("Cleared all authentication data");
    } catch (error) {
        console.warn("Error clearing auth data:", error);
    }
}
