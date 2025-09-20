import { useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { setupSessionRefresh, ensureValidSession } from "@/lib/session-refresh";

/**
 * Hook to manage user session and handle automatic refresh
 * This should be used in your main layout or app component
 */
export function useSessionManager() {
    const supabase = createClient();

    // Set up automatic session refresh
    useEffect(() => {
        const cleanup = setupSessionRefresh();
        return cleanup;
    }, []);

    // Handle auth state changes
    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.id);

            if (event === "SIGNED_OUT") {
                // Clear any cached data when user signs out
                console.log("User signed out, clearing cache");
            } else if (event === "SIGNED_IN" && session) {
                console.log(
                    "User signed in, session expires at:",
                    new Date(session.expires_at! * 1000)
                );
            } else if (event === "TOKEN_REFRESHED" && session) {
                console.log(
                    "Token refreshed, new expiry:",
                    new Date(session.expires_at! * 1000)
                );
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    // Function to manually refresh session
    const refreshSession = useCallback(async () => {
        const result = await ensureValidSession();
        if (!result.success) {
            console.warn("Manual session refresh failed:", result.error);
        }
        return result;
    }, []);

    // Function to check if session is valid
    const checkSession = useCallback(async () => {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();

        if (error) {
            console.error("Error checking session:", error);
            return { valid: false, error: error.message };
        }

        if (!session) {
            return { valid: false, error: "No active session" };
        }

        // Check if session is expired
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at || 0;

        if (now >= expiresAt) {
            return { valid: false, error: "Session expired" };
        }

        return { valid: true, session };
    }, [supabase.auth]);

    return {
        refreshSession,
        checkSession,
    };
}
