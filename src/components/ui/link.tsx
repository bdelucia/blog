import React from "react";
import { cn } from "../../lib/utils";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children: React.ReactNode;
    className?: string;
    external?: boolean;
    useRouter?: boolean;
}

export function Link({
    href,
    children,
    className,
    external = false,
    useRouter = false,
    ...props
}: LinkProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // If it's marked as external or starts with http/mailto/tel, let it behave normally
        if (
            external ||
            href.startsWith("http") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
        ) {
            return;
        }

        // For internal links, prevent default and handle navigation
        e.preventDefault();

        if (useRouter) {
            // Use the router hook if available
            // This would be passed down from a parent component
            const router = (
                window as Window & {
                    __router?: { push: (path: string) => void };
                }
            ).__router;
            if (router && router.push) {
                router.push(href);
            } else {
                // Fallback to history API
                window.history.pushState({}, "", href);
                window.dispatchEvent(new PopStateEvent("popstate"));
            }
        } else {
            // Use history.pushState for client-side navigation
            // This works better with Express server-side routing
            window.history.pushState({}, "", href);

            // Dispatch a popstate event to trigger route changes
            // This allows your app to respond to navigation changes
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    };

    // Determine if link should be treated as external
    const isExternal =
        external ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:");

    return (
        <a
            href={href}
            className={cn(className)}
            onClick={handleClick}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            {...props}
        >
            {children}
        </a>
    );
}
