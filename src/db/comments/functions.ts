import { createClient } from "@/utils/supabase/server";
import {
    validateCreateComment,
    validateUpdateComment,
    validateCreateCommentLike,
    validateCommentId,
    CreateCommentInput,
    UpdateCommentInput,
    CreateCommentLikeInput,
} from "./validation";

// Helper functions to transform Supabase data to our interface format
function transformComment(data: any): Comment {
    return {
        id: data.id,
        content: data.content,
        articleId: data.article_id,
        userId: data.user_id,
        parentId: data.parent_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        user: data.users
            ? {
                  id: data.users.id,
                  email: data.users.email,
                  fullName: data.users.full_name,
                  avatarUrl: data.users.avatar_url,
              }
            : undefined,
    };
}

function transformCommentLike(data: any): CommentLike {
    return {
        id: data.id,
        commentId: data.comment_id,
        userId: data.user_id,
        createdAt: data.created_at,
        user: data.users
            ? {
                  id: data.users.id,
                  email: data.users.email,
                  fullName: data.users.full_name,
                  avatarUrl: data.users.avatar_url,
              }
            : undefined,
    };
}

// Types
export interface Comment {
    id: number;
    content: string;
    articleId: number;
    userId: string;
    parentId: number | null;
    createdAt: string;
    updatedAt: string;
    // Joined data
    user?: {
        id: string;
        email: string;
        fullName: string | null;
        avatarUrl: string | null;
    };
    likes?: CommentLike[];
    replies?: Comment[];
    likesCount?: number;
    userLiked?: boolean;
}

export interface CommentLike {
    id: number;
    commentId: number;
    userId: string;
    createdAt: string;
    user?: {
        id: string;
        email: string;
        fullName: string | null;
        avatarUrl: string | null;
    };
}

// Get comments for an article
export async function getCommentsByArticle(
    articleId: number,
    options: {
        includeLikes?: boolean;
        limit?: number;
        offset?: number;
        sortBy?: "created_at" | "updated_at";
        sortOrder?: "asc" | "desc";
    } = {}
): Promise<Comment[]> {
    const supabase = await createClient();

    const {
        includeLikes = false,
        limit = 20,
        offset = 0,
        sortBy = "created_at",
        sortOrder = "desc",
    } = options;

    let query = supabase
        .from("comments")
        .select(
            `
            id,
            content,
            article_id,
            user_id,
            parent_id,
            created_at,
            updated_at,
            users!inner(
                id,
                email,
                full_name,
                avatar_url
            )
        `
        )
        .eq("article_id", articleId)
        .is("parent_id", null) // Only top-level comments
        .order(sortBy, { ascending: sortOrder === "asc" })
        .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching comments:", error);
        throw new Error("Failed to fetch comments");
    }

    if (!data) return [];

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
        data.map(async (comment: any) => {
            const replies = await getCommentReplies(comment.id);
            return {
                ...comment,
                replies,
            };
        })
    );

    // Get likes if requested
    if (includeLikes) {
        const commentsWithLikes = await Promise.all(
            commentsWithReplies.map(async (comment: any) => {
                const likes = await getCommentLikes(comment.id);
                return {
                    ...comment,
                    likes,
                    likesCount: likes.length,
                };
            })
        );
        return commentsWithLikes;
    }

    return commentsWithReplies;
}

// Get replies for a specific comment
export async function getCommentReplies(parentId: number): Promise<Comment[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("comments")
        .select(
            `
            id,
            content,
            article_id,
            user_id,
            parent_id,
            created_at,
            updated_at,
            users!inner(
                id,
                email,
                full_name,
                avatar_url
            )
        `
        )
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching comment replies:", error);
        return [];
    }

    return (data || []).map(transformComment);
}

// Get likes for a specific comment
export async function getCommentLikes(
    commentId: number
): Promise<CommentLike[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("comment_likes")
        .select(
            `
            id,
            comment_id,
            user_id,
            created_at,
            users!inner(
                id,
                email,
                full_name,
                avatar_url
            )
        `
        )
        .eq("comment_id", commentId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching comment likes:", error);
        return [];
    }

    return (data || []).map(transformCommentLike);
}

// Create a new comment
export async function createComment(
    data: CreateCommentInput
): Promise<Comment | null> {
    const supabase = await createClient();
    const validatedData = validateCreateComment(data);

    const { data: comment, error } = await supabase
        .from("comments")
        .insert({
            content: validatedData.content,
            article_id: validatedData.articleId,
            user_id: validatedData.userId,
            parent_id: validatedData.parentId || null,
        })
        .select(
            `
            id,
            content,
            article_id,
            user_id,
            parent_id,
            created_at,
            updated_at,
            users!inner(
                id,
                email,
                full_name,
                avatar_url
            )
        `
        )
        .single();

    if (error) {
        console.error("Error creating comment:", error);
        throw new Error("Failed to create comment");
    }

    return transformComment(comment);
}

// Update a comment
export async function updateComment(
    commentId: number,
    data: UpdateCommentInput,
    userId: string
): Promise<Comment | null> {
    const supabase = await createClient();
    const validatedData = validateUpdateComment(data);
    const validatedId = validateCommentId(commentId);

    // Check if user owns the comment
    const { data: existingComment, error: fetchError } = await supabase
        .from("comments")
        .select("user_id")
        .eq("id", validatedId)
        .single();

    if (fetchError || !existingComment) {
        throw new Error("Comment not found");
    }

    if (existingComment.user_id !== userId) {
        throw new Error("Not authorized to update this comment");
    }

    const { data: comment, error } = await supabase
        .from("comments")
        .update({
            content: validatedData.content,
            updated_at: new Date().toISOString(),
        })
        .eq("id", validatedId)
        .select(
            `
            id,
            content,
            article_id,
            user_id,
            parent_id,
            created_at,
            updated_at,
            users!inner(
                id,
                email,
                full_name,
                avatar_url
            )
        `
        )
        .single();

    if (error) {
        console.error("Error updating comment:", error);
        throw new Error("Failed to update comment");
    }

    return transformComment(comment);
}

// Delete a comment
export async function deleteComment(
    commentId: number,
    userId: string
): Promise<boolean> {
    const supabase = await createClient();
    const validatedId = validateCommentId(commentId);

    // Check if user owns the comment
    const { data: existingComment, error: fetchError } = await supabase
        .from("comments")
        .select("user_id")
        .eq("id", validatedId)
        .single();

    if (fetchError || !existingComment) {
        throw new Error("Comment not found");
    }

    if (existingComment.user_id !== userId) {
        throw new Error("Not authorized to delete this comment");
    }

    const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", validatedId);

    if (error) {
        console.error("Error deleting comment:", error);
        throw new Error("Failed to delete comment");
    }

    return true;
}

// Like a comment
export async function likeComment(
    data: CreateCommentLikeInput
): Promise<CommentLike | null> {
    const supabase = await createClient();
    const validatedData = validateCreateCommentLike(data);

    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
        .from("comment_likes")
        .select("id")
        .eq("comment_id", validatedData.commentId)
        .eq("user_id", validatedData.userId)
        .single();

    if (existingLike) {
        throw new Error("Comment already liked");
    }

    const { data: like, error } = await supabase
        .from("comment_likes")
        .insert({
            comment_id: validatedData.commentId,
            user_id: validatedData.userId,
        })
        .select(
            `
            id,
            comment_id,
            user_id,
            created_at,
            users!inner(
                id,
                email,
                full_name,
                avatar_url
            )
        `
        )
        .single();

    if (error) {
        console.error("Error liking comment:", error);
        throw new Error("Failed to like comment");
    }

    return transformCommentLike(like);
}

// Unlike a comment
export async function unlikeComment(
    commentId: number,
    userId: string
): Promise<boolean> {
    const supabase = await createClient();
    const validatedId = validateCommentId(commentId);

    const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", validatedId)
        .eq("user_id", userId);

    if (error) {
        console.error("Error unliking comment:", error);
        throw new Error("Failed to unlike comment");
    }

    return true;
}

// Check if user liked a comment
export async function hasUserLikedComment(
    commentId: number,
    userId: string
): Promise<boolean> {
    const supabase = await createClient();
    const validatedId = validateCommentId(commentId);

    const { data, error } = await supabase
        .from("comment_likes")
        .select("id")
        .eq("comment_id", validatedId)
        .eq("user_id", userId)
        .single();

    if (error && error.code !== "PGRST116") {
        console.error("Error checking if user liked comment:", error);
        return false;
    }

    return !!data;
}

// Get a single comment by ID
export async function getCommentById(
    commentId: number
): Promise<Comment | null> {
    const supabase = await createClient();
    const validatedId = validateCommentId(commentId);

    const { data, error } = await supabase
        .from("comments")
        .select(
            `
            id,
            content,
            article_id,
            user_id,
            parent_id,
            created_at,
            updated_at,
            users!inner(
                id,
                email,
                full_name,
                avatar_url
            )
        `
        )
        .eq("id", validatedId)
        .single();

    if (error) {
        console.error("Error fetching comment:", error);
        return null;
    }

    return transformComment(data);
}
