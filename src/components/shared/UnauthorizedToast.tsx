"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function UnauthorizedToast() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || typeof window === "undefined") return;

        const urlParams = new URLSearchParams(window.location.search);
        const unauthorized = urlParams.get("unauthorized");

        if (unauthorized === "true") {
            toast.error("You are not authorized to view that page", {
                duration: 5000,
                description: "You need admin privileges to access this area.",
            });

            // Clean up the URL by removing the query parameter
            const url = new URL(window.location.href);
            url.searchParams.delete("unauthorized");
            window.history.replaceState({}, "", url.toString());
        }
    }, [mounted]);

    if (!mounted) {
        return null;
    }

    return null; // This component doesn't render anything
}
