"use client";

import { useSessionManager } from "@/hooks/useSessionManager";

/**
 * Session provider component that manages authentication state
 * This should wrap your app to ensure session management is active
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
    // Initialize session management
    useSessionManager();

    return <>{children}</>;
}
