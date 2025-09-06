"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AuthUser } from "@/lib/auth";

export function useAuthState() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const supabase = createClient();

                // Get initial session
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (!mounted) return;

                if (error) {
                    console.error("Error getting session:", error);
                    setUser(null);
                } else if (session?.user) {
                    // Get user data from our database
                    try {
                        const response = await fetch("/api/auth/get-user", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });

                        if (!mounted) return;

                        if (response.ok) {
                            const userData = await response.json();
                            setUser(userData);
                        } else {
                            setUser(null);
                        }
                    } catch (error) {
                        console.error("Error getting user data:", error);
                        if (mounted) {
                            setUser(null);
                        }
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error initializing auth:", error);
                if (mounted) {
                    setUser(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                    setInitialized(true);
                }
            }
        };

        initializeAuth();

        // Listen for auth changes
        const supabase = createClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (event === "SIGNED_IN" && session?.user) {
                try {
                    const response = await fetch("/api/auth/get-user", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (!mounted) return;

                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Error getting user data:", error);
                    if (mounted) {
                        setUser(null);
                    }
                }
            } else if (event === "SIGNED_OUT") {
                if (mounted) {
                    setUser(null);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return { user, loading, initialized };
}
