import { createClient } from "@/utils/supabase/server";
import { users, userProfiles } from "./schema";
import { eq, desc } from "drizzle-orm";
import {
    validateCreateUser,
    validateUpdateUser,
    validateUserProfile,
    validateUpdateUserProfile,
    validateUserId,
    validateEmail,
    safeValidateCreateUser,
    safeValidateUpdateUser,
    safeValidateUserProfile,
    safeValidateUpdateUserProfile,
    safeValidateUserId,
    safeValidateEmail,
    type CreateUserInput,
    type UpdateUserInput,
    type UserProfileInput,
    type UpdateUserProfileInput,
    type UserRole,
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
        .order("createdAt", { ascending: false });

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
            .order("createdAt", { ascending: false });

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

export async function getUserProfile(id: string): Promise<UserProfile | null> {
    try {
        // Validate ID with Zod
        const validatedId = validateUserId(id);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", validatedId)
            .single();

        if (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "Validation error fetching user profile:",
                error.message
            );
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error fetching user profile:", error);
        return null;
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

export async function createUserProfile(
    profileData: CreateUserProfileData
): Promise<UserProfile | null> {
    try {
        // Validate input data with Zod
        const validatedData = validateUserProfile(profileData);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("user_profiles")
            .insert({
                id: validatedData.id,
                bio: validatedData.bio || null,
                website: validatedData.website || null,
                location: validatedData.location || null,
                twitter_handle: validatedData.twitterHandle || null,
                github_handle: validatedData.githubHandle || null,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating user profile:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "Validation error creating user profile:",
                error.message
            );
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error creating user profile:", error);
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

export async function updateUserProfile(
    id: string,
    updateData: UpdateUserProfileData
): Promise<UserProfile | null> {
    try {
        // Validate ID and input data with Zod
        const validatedId = validateUserId(id);
        const validatedData = validateUpdateUserProfile(updateData);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("user_profiles")
            .update({
                bio: validatedData.bio,
                website: validatedData.website,
                location: validatedData.location,
                twitter_handle: validatedData.twitterHandle,
                github_handle: validatedData.githubHandle,
                updated_at: new Date().toISOString(),
            })
            .eq("id", validatedId)
            .select()
            .single();

        if (error) {
            console.error("Error updating user profile:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "Validation error updating user profile:",
                error.message
            );
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error updating user profile:", error);
        return null;
    }
}

export async function promoteToAdmin(id: string): Promise<User | null> {
    try {
        // Validate ID with Zod
        const validatedId = validateUserId(id);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("users")
            .update({
                role: "admin",
                updated_at: new Date().toISOString(),
            })
            .eq("id", validatedId)
            .select()
            .single();

        if (error) {
            console.error("Error promoting user to admin:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "Validation error promoting user to admin:",
                error.message
            );
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error promoting user to admin:", error);
        return null;
    }
}

export async function demoteToUser(id: string): Promise<User | null> {
    try {
        // Validate ID with Zod
        const validatedId = validateUserId(id);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("users")
            .update({
                role: "user",
                updated_at: new Date().toISOString(),
            })
            .eq("id", validatedId)
            .select()
            .single();

        if (error) {
            console.error("Error demoting user:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error demoting user:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error demoting user:", error);
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

export async function deleteUserProfile(id: string): Promise<boolean> {
    try {
        // Validate ID with Zod
        const validatedId = validateUserId(id);

        const supabase = await createClient();
        const { error } = await supabase
            .from("user_profiles")
            .delete()
            .eq("id", validatedId);

        if (error) {
            console.error("Error deleting user profile:", error);
            return false;
        }
        return true;
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "Validation error deleting user profile:",
                error.message
            );
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error deleting user profile:", error);
        return false;
    }
}
