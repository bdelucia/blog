/**
 * Supabase configuration for extended session duration
 * This helps configure session settings for longer login periods
 */

export const SUPABASE_CONFIG = {
    auth: {
        // Session duration in seconds (7 days = 7 * 24 * 60 * 60)
        sessionDuration: 7 * 24 * 60 * 60, // 604800 seconds
        // Refresh token duration in seconds (30 days = 30 * 24 * 60 * 60)
        refreshTokenDuration: 30 * 24 * 60 * 60, // 2592000 seconds
        // Auto refresh tokens when they're close to expiring
        autoRefreshToken: true,
        // Persist session across browser sessions
        persistSession: true,
        // Detect session in URL (for OAuth callbacks)
        detectSessionInUrl: true,
    },
    cookies: {
        // Cookie settings for session persistence
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        // Max age for refresh token cookies (7 days)
        maxAge: 7 * 24 * 60 * 60, // 604800 seconds
    },
};

/**
 * Get Supabase auth options with extended session duration
 */
export function getSupabaseAuthOptions() {
    return {
        auth: {
            persistSession: SUPABASE_CONFIG.auth.persistSession,
            autoRefreshToken: SUPABASE_CONFIG.auth.autoRefreshToken,
            detectSessionInUrl: SUPABASE_CONFIG.auth.detectSessionInUrl,
            storage:
                typeof window !== "undefined"
                    ? {
                          getItem: (key: string) => {
                              try {
                                  return window.localStorage.getItem(key);
                              } catch {
                                  return null;
                              }
                          },
                          setItem: (key: string, value: string) => {
                              try {
                                  window.localStorage.setItem(key, value);
                              } catch {
                                  // Ignore storage errors
                              }
                          },
                          removeItem: (key: string) => {
                              try {
                                  window.localStorage.removeItem(key);
                              } catch {
                                  // Ignore storage errors
                              }
                          },
                      }
                    : undefined,
        },
    };
}

/**
 * Get cookie options for session persistence
 */
export function getCookieOptions() {
    return {
        httpOnly: SUPABASE_CONFIG.cookies.httpOnly,
        secure: SUPABASE_CONFIG.cookies.secure,
        sameSite: SUPABASE_CONFIG.cookies.sameSite,
        maxAge: SUPABASE_CONFIG.cookies.maxAge,
    };
}
