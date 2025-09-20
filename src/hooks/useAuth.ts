"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AuthUser } from "@/lib/auth";

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        const getInitialSession = async () => {
            try {
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (error) {
                    console.error("Error getting session:", error);
                    setUser(null);
                } else if (session?.user) {
                    // Get user data from our database
                    const response = await fetch("/api/auth/get-user", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error getting initial session:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
                // Get user data from our database
                try {
                    const response = await fetch("/api/auth/get-user", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Error getting user data:", error);
                    setUser(null);
                }
            } else if (event === "SIGNED_OUT") {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, loading };
}
