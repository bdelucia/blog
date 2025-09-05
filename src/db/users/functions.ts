import { createClient } from "@/utils/supabase/server";
import {
    validateCreateUser,
    validateUpdateUser,
    validateUserId,
    validateEmail,
} from "./validation";

// Types
export interface User {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: "admin" | "user";
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    id: string;
    bio: string | null;
    website: string | null;
    location: string | null;
    twitterHandle: string | null;
    githubHandle: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserData {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role?: "admin" | "user";
}

export interface UpdateUserData {
    fullName?: string;
    avatarUrl?: string;
    role?: "admin" | "user";
}

export interface CreateUserProfileData {
    id: string;
    bio?: string;
    website?: string;
    location?: string;
    twitterHandle?: string;
    githubHandle?: string;
}

export interface UpdateUserProfileData {
    bio?: string;
    website?: string;
    location?: string;
    twitterHandle?: string;
    githubHandle?: string;
}

// READ operations
export async function getUser(id: string): Promise<User | null> {
    try {
        // Validate ID with Zod
        const validatedId = validateUserId(id);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", validatedId)
            .single();

        if (error) {
            console.error("Error fetching user:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error fetching user:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error fetching user:", error);
        return null;
    }
}

export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        // Validate email with Zod
        const validatedEmail = validateEmail(email);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", validatedEmail)
            .single();

        if (error) {
            console.error("Error fetching user by email:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "Validation error fetching user by email:",
                error.message
            );
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error fetching user by email:", error);
        return null;
    }
}

export async function getAllUsers(): Promise<User[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching users:", error);
        return [];
    }
    return data || [];
}

export async function getUsersByRole(role: "admin" | "user"): Promise<User[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("role", role)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching users by role:", error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error("Unexpected error fetching users by role:", error);
        return [];
    }
}

// CREATE operations
export async function createUser(
    userData: CreateUserData
): Promise<User | null> {
    try {
        // Validate input data with Zod
        const validatedData = validateCreateUser(userData);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("users")
            .insert({
                id: validatedData.id,
                email: validatedData.email,
                full_name: validatedData.fullName || null,
                avatar_url: validatedData.avatarUrl || null,
                role: validatedData.role || "user",
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating user:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error creating user:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error creating user:", error);
        return null;
    }
}

// UPDATE operations
export async function updateUser(
    id: string,
    updateData: UpdateUserData
): Promise<User | null> {
    try {
        // Validate ID and input data with Zod
        const validatedId = validateUserId(id);
        const validatedData = validateUpdateUser(updateData);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("users")
            .update({
                full_name: validatedData.fullName,
                avatar_url: validatedData.avatarUrl,
                role: validatedData.role,
                updated_at: new Date().toISOString(),
            })
            .eq("id", validatedId)
            .select()
            .single();

        if (error) {
            console.error("Error updating user:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error updating user:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error updating user:", error);
        return null;
    }
}

// DELETE operations
export async function deleteUser(id: string): Promise<boolean> {
    try {
        // Validate ID with Zod
        const validatedId = validateUserId(id);

        const supabase = await createClient();
        const { error } = await supabase
            .from("users")
            .delete()
            .eq("id", validatedId);

        if (error) {
            console.error("Error deleting user:", error);
            return false;
        }
        return true;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error deleting user:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error deleting user:", error);
        return false;
    }
}
