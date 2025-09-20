import { createClient } from "@/utils/supabase/server";
import { getUser, createUser } from "@/db/users/functions";

// Auth types
export interface AuthUser {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: "admin" | "user";
}

// Server-side auth functions only
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        // Get user data from our users table
        const userData = await getUser(user.id);
        if (!userData) {
            // User doesn't exist in our database yet - this is normal for new users
            return null;
        }

        return {
            id: userData.id,
            email: userData.email,
            fullName: userData.fullName,
            avatarUrl: userData.avatarUrl,
            role: userData.role,
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

export async function requireAuth(): Promise<AuthUser> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Authentication required");
    }
    return user;
}

export async function requireAdmin(): Promise<AuthUser> {
    const user = await requireAuth();
    if (user.role !== "admin") {
        throw new Error("Admin access required");
    }
    return user;
}

export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === "admin";
}

export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

// Server-side user creation (called after successful signup)
export async function createUserAfterSignup(
    userId: string,
    email: string,
    fullName?: string,
    avatarUrl?: string
): Promise<AuthUser | null> {
    try {
        // First check if user already exists
        const existingUser = await getUser(userId);

        if (existingUser) {
            // User exists - NEVER override existing full_name or avatar_url
            // Only update the timestamp to show the user was active
            const supabase = await createClient();

            // Always update the timestamp, but NEVER override user data
            const { error } = await supabase
                .from("users")
                .update({
                    updated_at: new Date().toISOString(),
                })
                .eq("id", userId);

            if (error) {
                console.error("Error updating user timestamp:", error);
            }

            // Return the existing user data unchanged
            return {
                id: existingUser.id,
                email: existingUser.email,
                fullName: existingUser.fullName, // Always preserve original
                avatarUrl: existingUser.avatarUrl, // Always preserve original
                role: existingUser.role,
            };
        }

        const newUser = await createUser({
            id: userId,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            role: "user", // Default role
        });

        // Return the created user data
        if (newUser) {
            return {
                id: newUser.id,
                email: newUser.email,
                fullName: newUser.fullName,
                avatarUrl: newUser.avatarUrl,
                role: newUser.role,
            };
        }

        return null;
    } catch (error) {
        console.error("Error creating user record:", error);
        throw error;
    }
}

// Role-based access control helpers
export function canAccessAdmin(user: AuthUser | null): boolean {
    return user?.role === "admin";
}

export function canAccessUserContent(user: AuthUser | null): boolean {
    return user !== null;
}

export function canAccessPublicContent(): boolean {
    return true; // Everyone can access public content
}

// Utility functions
export function getRoleDisplayName(role: "admin" | "user"): string {
    switch (role) {
        case "admin":
            return "Administrator";
        case "user":
            return "User";
        default:
            return "Unknown";
    }
}

export function getRoleColor(role: "admin" | "user"): string {
    switch (role) {
        case "admin":
            return "text-red-600 dark:text-red-400";
        case "user":
            return "text-blue-600 dark:text-blue-400";
        default:
            return "text-gray-600 dark:text-gray-400";
    }
}
