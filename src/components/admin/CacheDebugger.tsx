"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function CacheDebugger() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const checkCache = () => {
            const postsCache = queryClient.getQueryData(["admin-posts"]);
            const usersCache = queryClient.getQueryData(["admin-users"]);

            console.log("🔍 Cache Debug:", {
                posts: postsCache ? "✅ CACHED" : "❌ NOT CACHED",
                users: usersCache ? "✅ CACHED" : "❌ NOT CACHED",
                postsData: postsCache,
                usersData: usersCache,
            });
        };

        // Check cache immediately
        checkCache();

        // Check cache every 2 seconds for debugging
        const interval = setInterval(checkCache, 2000);

        return () => clearInterval(interval);
    }, [queryClient]);

    return null; // This component doesn't render anything
}
