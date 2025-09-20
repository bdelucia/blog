"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/client";

// Check if user has a valid session before making API call
const checkSession = async (): Promise<boolean> => {
    try {
        const supabase = createClient();
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();
        return !error && !!session?.user;
    } catch {
        return false;
    }
};

// Fetch user data from API
const fetchUser = async (): Promise<AuthUser> => {
    // First check if we have a valid session
    const hasValidSession = await checkSession();
    if (!hasValidSession) {
        throw new Error("Not authenticated");
    }

    try {
        const response = await fetch("/api/auth/get-user", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies for authentication
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Not authenticated");
            }
            if (response.status === 404) {
                // User doesn't exist in database yet, this might be a new user
                throw new Error("User not found");
            }
            throw new Error("Failed to fetch user");
        }

        return response.json();
    } catch (error) {
        // Handle network errors or other fetch errors
        if (
            error instanceof Error &&
            error.message.includes("Invalid Refresh Token")
        ) {
            throw new Error("Not authenticated");
        }
        throw error;
    }
};

// Update user profile
const updateUserProfile = async (data: {
    fullName: string;
    avatarUrl?: string | null;
}): Promise<{ success: boolean; user: AuthUser }> => {
    const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
    }

    return response.json();
};

// Hook to get current user data
export function useUser(enabled: boolean = true) {
    return useQuery({
        queryKey: ["user"],
        queryFn: fetchUser,
        enabled, // Only run when enabled is true
        retry: (failureCount, error) => {
            // Don't retry on 401 (unauthorized)
            if (error.message === "Not authenticated") {
                return false;
            }
            // Retry up to 3 times for "User not found" (new user case)
            if (error.message === "User not found") {
                return failureCount < 3;
            }
            return failureCount < 1;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Hook to update user profile with optimistic updates
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUserProfile,
        onMutate: async (newData) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["user"] });

            // Snapshot previous value
            const previousUser = queryClient.getQueryData<AuthUser>(["user"]);

            // Optimistically update the cache
            if (previousUser) {
                const updatedUser = {
                    ...previousUser,
                    fullName: newData.fullName,
                    avatarUrl: newData.avatarUrl ?? null,
                };
                queryClient.setQueryData<AuthUser>(["user"], updatedUser);
            }

            return { previousUser };
        },
        onError: (err, newData, context) => {
            // Rollback on error
            if (context?.previousUser) {
                queryClient.setQueryData(["user"], context.previousUser);
            }
            console.error("Error updating profile:", err);
        },
        onSuccess: (data) => {
            // Update with server response to ensure consistency
            queryClient.setQueryData(["user"], data.user);
        },
    });
}

// Hook to clear user data (for logout)
export function useClearUser() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.removeQueries({ queryKey: ["user"] });
    };
}

// Hook to update user data in cache (for user creation/updates)
export function useUpdateUserCache() {
    const queryClient = useQueryClient();

    return (userData: AuthUser) => {
        queryClient.setQueryData(["user"], userData);
    };
}

// Hook to invalidate user cache (force refetch)
export function useInvalidateUser() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ["user"] });
    };
}

// Hook to handle user deletion (clear cache)
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.removeQueries({ queryKey: ["user"] });
    };
}
