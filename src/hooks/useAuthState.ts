"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AuthUser } from "@/lib/auth";
import { useUser, useClearUser } from "@/hooks/useUserQuery";

export function useAuthState() {
    const [mounted, setMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);

    // Use React Query for user data - only when authenticated
    const shouldFetchUser = isAuthenticated && sessionChecked;
    const { data: user, isLoading, error } = useUser(shouldFetchUser);
    const clearUser = useClearUser();

    // Function to update user data after profile changes
    const updateUser = (updatedUserData: Partial<AuthUser>) => {
        // This is now handled by React Query's optimistic updates
        // The useUpdateProfile hook will handle this automatically
        console.log("User update requested:", updatedUserData);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        let mountedRef = true;

        const initializeAuth = async () => {
            // Only run on client side to prevent hydration mismatch
            if (typeof window === "undefined") {
                return;
            }

            try {
                const supabase = createClient();

                // Get initial session
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (!mountedRef) return;

                if (error) {
                    console.error("Error getting session:", error);
                    setIsAuthenticated(false);
                } else if (session?.user) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }

                // Mark session as checked
                setSessionChecked(true);
            } catch (error) {
                console.error("Error initializing auth:", error);
                if (mountedRef) {
                    setIsAuthenticated(false);
                    setSessionChecked(true);
                }
            }
        };

        initializeAuth();

        // Listen for auth changes (only on client side)
        if (typeof window !== "undefined") {
            const supabase = createClient();
            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (!mountedRef) return;

                if (event === "SIGNED_IN" && session?.user) {
                    setIsAuthenticated(true);
                } else if (event === "SIGNED_OUT") {
                    if (mountedRef) {
                        setIsAuthenticated(false);
                        clearUser(); // Clear React Query cache
                    }
                }
            });

            return () => {
                mountedRef = false;
                subscription.unsubscribe();
            };
        }

        return () => {
            mountedRef = false;
        };
    }, [mounted, clearUser]);

    // Determine if we should show user data based on authentication status
    const loading = isLoading || !mounted || !sessionChecked;
    const initialized = mounted && sessionChecked;

    return {
        user: user || null,
        loading,
        initialized,
        updateUser,
    };
}
