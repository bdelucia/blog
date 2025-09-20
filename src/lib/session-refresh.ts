import { createClient } from "@/utils/supabase/client";

/**
 * Utility to refresh the user session and handle token renewal
 * This should be called periodically or when tokens are about to expire
 */
export async function refreshUserSession() {
    const supabase = createClient();

    try {
        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
            console.error("Error refreshing session:", error);
            return { success: false, error: error.message };
        }

        if (data.session) {
            console.log("Session refreshed successfully");
            return { success: true, session: data.session };
        }

        return { success: false, error: "No session data returned" };
    } catch (error) {
        console.error("Unexpected error refreshing session:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Check if the current session is valid and refresh if needed
 */
export async function ensureValidSession() {
    const supabase = createClient();

    try {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();

        if (error) {
            console.error("Error getting session:", error);
            return { success: false, error: error.message };
        }

        if (!session) {
            return { success: false, error: "No active session" };
        }

        // Check if the session is close to expiring (within 5 minutes)
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at || 0;
        const timeUntilExpiry = expiresAt - now;

        // If session expires within 5 minutes, refresh it
        if (timeUntilExpiry < 300) {
            console.log("Session expires soon, refreshing...");
            return await refreshUserSession();
        }

        return { success: true, session };
    } catch (error) {
        console.error("Unexpected error ensuring valid session:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Set up automatic session refresh
 * Call this in your app to automatically refresh sessions
 */
export function setupSessionRefresh() {
    // Refresh session every 10 minutes
    const refreshInterval = setInterval(async () => {
        const result = await ensureValidSession();
        if (!result.success) {
            console.warn("Session refresh failed:", result.error);
            // Optionally redirect to login or show a notification
        }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
}
