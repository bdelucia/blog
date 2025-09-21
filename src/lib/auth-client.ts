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

    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
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
        },
    });

    if (error) {
        console.error("Google OAuth error:", error);
        throw new Error(error.message);
    }

    return data;
}
