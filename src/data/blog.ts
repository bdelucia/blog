import { createClient } from "@/utils/supabase/server";
import { BLOG_IMGS_URL, BLUR_FADE_DELAY } from "@/lib/constants";

export { BLOG_IMGS_URL, BLUR_FADE_DELAY };

export interface Article {
    id: number;
    title: string;
    summary: string | null;
    image: string | null;
    datePosted: string | null;
    status: "draft" | "published";
    content: string | null;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateArticleData {
    title: string;
    summary?: string;
    image?: string;
    datePosted?: string;
    status?: "draft" | "published";
    content?: string;
    slug: string;
}

export interface UpdateArticleData {
    title?: string;
    summary?: string;
    image?: string;
    datePosted?: string;
    status?: "draft" | "published";
    content?: string;
    slug?: string;
}

// READ operations
export async function getBlogPosts(): Promise<Article[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("datePosted", { ascending: false });

    if (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }

    return data || [];
}

export async function getPost(slug: string): Promise<Article | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error) {
        console.error("Error fetching post:", error);
        return null;
    }

    return data;
}

export async function getAllPosts(): Promise<Article[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("Error fetching all posts:", error);
        return [];
    }

    return data || [];
}

export async function getPostById(id: number): Promise<Article | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching post by ID:", error);
        return null;
    }

    return data;
}

// CREATE operation
export async function createPost(
    postData: CreateArticleData
): Promise<Article | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("articles")
        .insert([postData])
        .select()
        .single();

    if (error) {
        console.error("Error creating post:", error);
        return null;
    }

    return data;
}

// UPDATE operation
export async function updatePost(
    id: number,
    postData: UpdateArticleData
): Promise<Article | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("articles")
        .update({ ...postData, updatedAt: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating post:", error);
        return null;
    }

    return data;
}

// DELETE operation
export async function deletePost(id: number): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
        console.error("Error deleting post:", error);
        return false;
    }

    return true;
}

// Utility functions
export async function getDraftPosts(): Promise<Article[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "draft")
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("Error fetching draft posts:", error);
        return [];
    }

    return data || [];
}

export async function publishPost(id: number): Promise<Article | null> {
    return updatePost(id, {
        status: "published",
        datePosted: new Date().toISOString(),
    });
}

export async function unpublishPost(id: number): Promise<Article | null> {
    return updatePost(id, { status: "draft" });
}
