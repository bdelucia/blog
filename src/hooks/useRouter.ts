import { useState, useEffect } from "react";

export function useRouter() {
    const [currentPath, setCurrentPath] = useState(() => {
        return window.location.pathname;
    });

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPath(window.location.pathname);
        };

        // Listen for browser navigation (back/forward buttons)
        window.addEventListener("popstate", handlePopState);

        // Listen for custom navigation events from our Link component
        const handleCustomPopState = () => {
            setCurrentPath(window.location.pathname);
        };

        window.addEventListener("popstate", handleCustomPopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("popstate", handleCustomPopState);
        };
    }, []);

    const push = (path: string) => {
        window.history.pushState({}, "", path);
        setCurrentPath(path);
        window.dispatchEvent(new PopStateEvent("popstate"));
    };

    const replace = (path: string) => {
        window.history.replaceState({}, "", path);
        setCurrentPath(path);
        window.dispatchEvent(new PopStateEvent("popstate"));
    };

    return {
        pathname: currentPath,
        push,
        replace,
    };
}
