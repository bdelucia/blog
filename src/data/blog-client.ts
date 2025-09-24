// Client-safe blog data types and constants
export const BLOG_IMGS_URL =
    process.env.NEXT_PUBLIC_BLOG_IMGS_URL || "/images/";

export interface Article {
    id: number;
    slug: string;
    title: string;
    summary: string | null;
    content: string | null;
    image: string | null;
    tags: string[] | null;
    datePosted: string | null;
    createdAt: string;
    updatedAt: string | null;
    status: "draft" | "published";
    order: number | null;
}
