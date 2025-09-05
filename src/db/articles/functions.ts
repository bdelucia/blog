import { createClient } from "@/utils/supabase/server";
import { articles } from "./schema";
import { eq, desc, and } from "drizzle-orm";
import {
    validateCreateArticle,
    validateUpdateArticle,
    validateArticleId,
    validateSlug,
    safeValidateCreateArticle,
    safeValidateUpdateArticle,
    safeValidateArticleId,
    safeValidateSlug,
    type CreateArticleInput,
    type UpdateArticleInput,
} from "./validation";

// Types
export interface Article {
    id: number;
    title: string;
    summary: string | null;
    image: string | null;
    tags: string[] | null;
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
    tags?: string[];
    datePosted?: string;
    status?: "draft" | "published";
    content?: string;
    slug: string;
}

export interface UpdateArticleData {
    title?: string;
    summary?: string;
    image?: string;
    tags?: string[];
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
    try {
        // Validate slug with Zod
        const validatedSlug = validateSlug(slug);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("articles")
            .select("*")
            .eq("slug", validatedSlug)
            .single();

        if (error) {
            console.error("Error fetching post:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error fetching post:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error fetching post:", error);
        return null;
    }
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

export async function getPostsByTag(tag: string): Promise<Article[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("articles")
        .select("*")
        .contains("tags", [tag])
        .eq("status", "published")
        .order("datePosted", { ascending: false });

    if (error) {
        console.error("Error fetching posts by tag:", error);
        return [];
    }
    return data || [];
}

// CREATE operations
export async function createPost(
    postData: CreateArticleData
): Promise<Article | null> {
    try {
        // Validate input data with Zod
        const validatedData = validateCreateArticle(postData);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("articles")
            .insert({
                title: validatedData.title,
                summary: validatedData.summary || null,
                image: validatedData.image || null,
                tags: validatedData.tags || null,
                datePosted: validatedData.datePosted || null,
                status: validatedData.status || "draft",
                content: validatedData.content || null,
                slug: validatedData.slug,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating post:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error creating post:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error creating post:", error);
        return null;
    }
}

// UPDATE operations
export async function updatePost(
    id: number,
    updateData: UpdateArticleData
): Promise<Article | null> {
    try {
        // Validate ID and input data with Zod
        const validatedId = validateArticleId(id);
        const validatedData = validateUpdateArticle(updateData);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("articles")
            .update({
                ...validatedData,
                updatedAt: new Date().toISOString(),
            })
            .eq("id", validatedId)
            .select()
            .single();

        if (error) {
            console.error("Error updating post:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error updating post:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error updating post:", error);
        return null;
    }
}

export async function publishPost(id: number): Promise<Article | null> {
    try {
        // Validate ID with Zod
        const validatedId = validateArticleId(id);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("articles")
            .update({
                status: "published",
                datePosted: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .eq("id", validatedId)
            .select()
            .single();

        if (error) {
            console.error("Error publishing post:", error);
            return null;
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error publishing post:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error publishing post:", error);
        return null;
    }
}

export async function unpublishPost(id: number): Promise<Article | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("articles")
        .update({
            status: "draft",
            datePosted: null,
            updatedAt: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error unpublishing post:", error);
        return null;
    }
    return data;
}

// DELETE operations
export async function deletePost(id: number): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
        console.error("Error deleting post:", error);
        return false;
    }
    return true;
}

export async function deletePostBySlug(slug: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase.from("articles").delete().eq("slug", slug);

    if (error) {
        console.error("Error deleting post by slug:", error);
        return false;
    }
    return true;
}

// UTILITY functions
export async function postExists(slug: string): Promise<boolean> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("articles")
        .select("id")
        .eq("slug", slug)
        .single();

    if (error) {
        return false;
    }
    return !!data;
}

export async function getPostCount(): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error("Error getting post count:", error);
        return 0;
    }
    return count || 0;
}

export async function getPublishedPostCount(): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

    if (error) {
        console.error("Error getting published post count:", error);
        return 0;
    }
    return count || 0;
}
