export const BLOG_IMGS_URL = "/api/images/";

export interface BlogPost {
    id: number;
    slug: string;
    title: string;
    summary: string;
    content?: string;
    published_at: string;
    image_url?: string;
    tags?: string[];
}

export interface BlogPostMetadata {
    title: string;
    summary: string;
    publishedAt: string;
    image?: string;
    tags?: string[];
}

// Fallback data for when the API is not available
const FALLBACK_POSTS: BlogPost[] = [
    {
        id: 1,
        slug: "getting-started-with-vite",
        title: "Getting Started with Vite",
        summary:
            "Learn how to set up a Vite project with React and TypeScript.",
        published_at: "2024-01-15T00:00:00Z",
        image_url: "/api/images/vite-logo.png",
        tags: ["vite", "react", "typescript", "frontend"],
    },
    {
        id: 2,
        slug: "building-a-blog-with-express",
        title: "Building a Blog with Express",
        summary:
            "Create a full-stack blog application using Express and React.",
        published_at: "2024-01-20T00:00:00Z",
        image_url: "/api/images/express-logo.png",
        tags: ["express", "nodejs", "api", "backend"],
    },
];

export async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        const response = await fetch("/api/posts");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts = await response.json();
        return posts;
    } catch (error) {
        console.warn("API not available, using fallback data:", error);
        return FALLBACK_POSTS;
    }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const post = await response.json();
        return post;
    } catch (error) {
        console.warn("API not available, checking fallback data:", error);
        // Check fallback data
        const fallbackPost = FALLBACK_POSTS.find((post) => post.slug === slug);
        return fallbackPost || null;
    }
}

// Helper function to convert API response to metadata format
export function postToMetadata(post: BlogPost): BlogPostMetadata {
    return {
        title: post.title,
        summary: post.summary,
        publishedAt: post.published_at,
        image: post.image_url,
        tags: post.tags,
    };
}
