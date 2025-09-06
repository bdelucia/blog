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

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
        throw new Error(error.message);
    }
}

export async function signInWithGoogle() {
    const supabase = getClientAuth();

    // Use the Supabase callback URL and then redirect to our app
    const redirectUrl = `${window.location.origin}/auth/callback`;

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

    // Use the Supabase callback URL and then redirect to our app
    const redirectUrl = `${window.location.origin}/auth/callback`;

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
