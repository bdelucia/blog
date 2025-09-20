// Google Analytics utility functions

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track page views
export const pageview = (url: string) => {
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("config", GA_TRACKING_ID, {
            page_path: url,
        });
    }
};

// Track custom events
export const event = ({
    action,
    category,
    label,
    value,
}: {
    action: string;
    category: string;
    label?: string;
    value?: number;
}) => {
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

// Track blog post views
export const trackBlogPostView = (postTitle: string, postSlug: string) => {
    event({
        action: "view_blog_post",
        category: "Blog",
        label: postTitle,
    });
};

// Track user interactions
export const trackComment = (postSlug: string) => {
    event({
        action: "comment",
        category: "Engagement",
        label: postSlug,
    });
};

// Track authentication events
export const trackAuth = (action: "login" | "signup" | "logout") => {
    event({
        action: action,
        category: "Authentication",
    });
};
