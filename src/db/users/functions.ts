import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

        // Map database column names to interface field names
        return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            role: data.role,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
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

        // Map database column names to interface field names
        return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            role: data.role,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
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
    try {
        // Try admin client first, fallback to regular client if service role key is missing
        let supabase;
        try {
            supabase = createAdminClient();
        } catch (adminError) {
            console.log(
                "Admin client failed, falling back to regular client:",
                adminError
            );
            const { createClient } = await import("@/utils/supabase/server");
            supabase = await createClient();
        }

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
            return [];
        }

        // Map database column names to interface field names
        const mappedUsers = (data || []).map((user) => ({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        }));

        return mappedUsers;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}

export async function getUsersByRole(role: "admin" | "user"): Promise<User[]> {
    try {
        // Try admin client first, fallback to regular client if service role key is missing
        let supabase;
        try {
            supabase = createAdminClient();
        } catch (adminError) {
            console.log(
                "Admin client failed, falling back to regular client:",
                adminError
            );
            const { createClient } = await import("@/utils/supabase/server");
            supabase = await createClient();
        }

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("role", role)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching users by role:", error);
            return [];
        }

        // Map database column names to interface field names
        return (data || []).map((user) => ({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        }));
    } catch (error) {
        console.error("Failed to fetch users by role:", error);
        return [];
    }
}

export async function getUsersCreatedInLastWeek(): Promise<User[]> {
    try {
        // Try admin client first, fallback to regular client if service role key is missing
        let supabase;
        try {
            supabase = createAdminClient();
        } catch (adminError) {
            console.log(
                "Admin client failed, falling back to regular client:",
                adminError
            );
            const { createClient } = await import("@/utils/supabase/server");
            supabase = await createClient();
        }

        // Calculate date 7 days ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoISO = oneWeekAgo.toISOString();

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .gte("created_at", oneWeekAgoISO)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching users created in last week:", error);
            return [];
        }

        // Map database column names to interface field names
        return (data || []).map((user) => ({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        }));
    } catch (error) {
        console.error("Failed to fetch users created in last week:", error);
        return [];
    }
}

export interface UsersChartDataPoint {
    date: string;
    users: number;
}

export async function getUsersChartData(
    days: number,
    viewType: "cumulative" | "daily"
): Promise<UsersChartDataPoint[]> {
    try {
        // Try admin client first, fallback to regular client if service role key is missing
        let supabase;
        try {
            supabase = createAdminClient();
        } catch (adminError) {
            console.log(
                "Admin client failed, falling back to regular client:",
                adminError
            );
            const { createClient } = await import("@/utils/supabase/server");
            supabase = await createClient();
        }

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateISO = startDate.toISOString();

        // Fetch users created within the date range
        const { data: usersData, error } = await supabase
            .from("users")
            .select("created_at")
            .gte("created_at", startDateISO)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching users chart data:", error);
            return [];
        }

        // Create a map to count users per day
        const dailyCounts = new Map<string, number>();

        // Initialize all days in the range with 0
        for (let i = 0; i < days; i++) {
            const date = new Date(endDate);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            dailyCounts.set(dateStr, 0);
        }

        // Count users per day
        (usersData || []).forEach((user) => {
            const dateStr = user.created_at.split("T")[0];
            const currentCount = dailyCounts.get(dateStr) || 0;
            dailyCounts.set(dateStr, currentCount + 1);
        });

        // Convert to array and sort by date
        const chartData = Array.from(dailyCounts.entries())
            .map(([date, count]) => ({
                date,
                users: count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // If cumulative view, calculate running total
        if (viewType === "cumulative") {
            let runningTotal = 0;
            return chartData.map((item) => {
                runningTotal += item.users;
                return {
                    date: item.date,
                    users: runningTotal,
                };
            });
        }

        // Return daily data
        return chartData;
    } catch (error) {
        console.error("Failed to fetch users chart data:", error);
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

        // Map database column names to interface field names
        return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            role: data.role,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
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

        // Map database column names to interface field names
        return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            role: data.role,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
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
