import { createClient } from "@/utils/supabase/server";
import {
    validateCreateComment,
    validateUpdateComment,
    validateModerateComment,
    validateCreateCommentReaction,
    validateCreateCommentMention,
    validateCommentId,
    validateCommentQuery,
    CommentQueryInput,
} from "./validation";

// Types
export interface Comment {
    id: number;
    content: string;
    articleId: number;
    userId: string;
    parentId: number | null;
    status: "pending" | "approved" | "rejected" | "spam";
    isEdited: boolean;
    editReason: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    updatedAt: string;
    editedAt: string | null;
    moderatedAt: string | null;
    moderatedBy: string | null;
    // Joined data
    user?: {
        id: string;
        email: string;
        fullName: string | null;
        avatarUrl: string | null;
    };
    reactions?: CommentReaction[];
    mentions?: CommentMention[];
    replies?: Comment[];
    reactionCounts?: Record<string, number>;
    userReaction?: string | null;
}

export interface CommentReaction {
    id: number;
    commentId: number;
    userId: string;
    reactionType: string;
    createdAt: string;
    user?: {
        id: string;
        fullName: string | null;
        avatarUrl: string | null;
    };
}

export interface CommentMention {
    id: number;
    commentId: number;
    mentionedUserId: string;
    createdAt: string;
    mentionedUser?: {
        id: string;
        fullName: string | null;
        avatarUrl: string | null;
    };
}

export interface CreateCommentData {
    content: string;
    articleId: number;
    userId: string;
    parentId?: number;
    ipAddress?: string;
    userAgent?: string;
}

export interface UpdateCommentData {
    content?: string;
    editReason?: string;
}

export interface ModerateCommentData {
    status: "pending" | "approved" | "rejected" | "spam";
    moderatedBy: string;
}

export interface CreateCommentReactionData {
    commentId: number;
    userId: string;
    reactionType: string;
}

export interface CreateCommentMentionData {
    commentId: number;
    mentionedUserId: string;
}

// READ operations
export async function getComment(id: number): Promise<Comment | null> {
    try {
        const validatedId = validateCommentId(id);
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("comments")
            .select(
                `
                *,
                user:users(id, email, full_name, avatar_url),
                reactions:comment_reactions(
                    id,
                    reaction_type,
                    created_at,
                    user:users(id, full_name, avatar_url)
                )
            `
            )
            .eq("id", validatedId)
            .single();

        if (error) {
            console.error("Error fetching comment:", error);
            return null;
        }

        return transformCommentData(data);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error fetching comment:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error fetching comment:", error);
        return null;
    }
}

export async function getCommentsByArticle(
    articleId: number,
    options: Partial<CommentQueryInput> = {}
): Promise<Comment[]> {
    try {
        const validatedArticleId = validateCommentId(articleId);
        const validatedOptions = validateCommentQuery(options);
        const supabase = await createClient();

        let query = supabase
            .from("comments")
            .select(
                `
                *,
                user:users(id, email, full_name, avatar_url),
                reactions:comment_reactions(
                    id,
                    reaction_type,
                    created_at,
                    user:users(id, full_name, avatar_url)
                )
            `
            )
            .eq("article_id", validatedArticleId)
            .eq("status", "approved") // Only show approved comments
            .is("parent_id", null) // Only top-level comments
            .order(validatedOptions.sortBy, {
                ascending: validatedOptions.sortOrder === "asc",
            })
            .range(
                validatedOptions.offset,
                validatedOptions.offset + validatedOptions.limit - 1
            );

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching comments:", error);
            return [];
        }

        const comments = data?.map(transformCommentData) || [];

        // Get replies for each comment
        if (validatedOptions.includeReactions) {
            for (const comment of comments) {
                comment.replies = await getCommentReplies(comment.id);
            }
        }

        return comments;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error fetching comments:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error fetching comments:", error);
        return [];
    }
}

export async function getCommentReplies(parentId: number): Promise<Comment[]> {
    try {
        const validatedParentId = validateCommentId(parentId);
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("comments")
            .select(
                `
                *,
                user:users(id, email, full_name, avatar_url),
                reactions:comment_reactions(
                    id,
                    reaction_type,
                    created_at,
                    user:users(id, full_name, avatar_url)
                )
            `
            )
            .eq("parent_id", validatedParentId)
            .eq("status", "approved")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching comment replies:", error);
            return [];
        }

        return data?.map(transformCommentData) || [];
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "Validation error fetching comment replies:",
                error.message
            );
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error fetching comment replies:", error);
        return [];
    }
}

export async function getCommentsByUser(userId: string): Promise<Comment[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("comments")
            .select(
                `
                *,
                user:users(id, email, full_name, avatar_url),
                reactions:comment_reactions(
                    id,
                    reaction_type,
                    created_at,
                    user:users(id, full_name, avatar_url)
                )
            `
            )
            .eq("user_id", userId)
            .eq("status", "approved")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching user comments:", error);
            return [];
        }

        return data?.map(transformCommentData) || [];
    } catch (error) {
        console.error("Unexpected error fetching user comments:", error);
        return [];
    }
}

export async function getPendingComments(): Promise<Comment[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("comments")
            .select(
                `
                *,
                user:users(id, email, full_name, avatar_url)
            `
            )
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching pending comments:", error);
            return [];
        }

        return data?.map(transformCommentData) || [];
    } catch (error) {
        console.error("Unexpected error fetching pending comments:", error);
        return [];
    }
}

// CREATE operations
export async function createComment(
    commentData: CreateCommentData
): Promise<Comment | null> {
    try {
        const validatedData = validateCreateComment(commentData);
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("comments")
            .insert({
                content: validatedData.content,
                article_id: validatedData.articleId,
                user_id: validatedData.userId,
                parent_id: validatedData.parentId || null,
                ip_address: validatedData.ipAddress || null,
                user_agent: validatedData.userAgent || null,
            })
            .select(
                `
                *,
                user:users(id, email, full_name, avatar_url)
            `
            )
            .single();

        if (error) {
            console.error("Error creating comment:", error);
            return null;
        }

        return transformCommentData(data);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error creating comment:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error creating comment:", error);
        return null;
    }
}

// UPDATE operations
export async function updateComment(
    id: number,
    updateData: UpdateCommentData
): Promise<Comment | null> {
    try {
        const validatedId = validateCommentId(id);
        const validatedData = validateUpdateComment(updateData);
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("comments")
            .update({
                content: validatedData.content,
                edit_reason: validatedData.editReason,
                is_edited: true,
                edited_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", validatedId)
            .select(
                `
                *,
                user:users(id, email, full_name, avatar_url)
            `
            )
            .single();

        if (error) {
            console.error("Error updating comment:", error);
            return null;
        }

        return transformCommentData(data);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error updating comment:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error updating comment:", error);
        return null;
    }
}

export async function moderateComment(
    id: number,
    moderateData: ModerateCommentData
): Promise<Comment | null> {
    try {
        const validatedId = validateCommentId(id);
        const validatedData = validateModerateComment(moderateData);
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("comments")
            .update({
                status: validatedData.status,
                moderated_by: validatedData.moderatedBy,
                moderated_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", validatedId)
            .select(
                `
                *,
                user:users(id, email, full_name, avatar_url)
            `
            )
            .single();

        if (error) {
            console.error("Error moderating comment:", error);
            return null;
        }

        return transformCommentData(data);
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "Validation error moderating comment:",
                error.message
            );
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error moderating comment:", error);
        return null;
    }
}

// DELETE operations
export async function deleteComment(id: number): Promise<boolean> {
    try {
        const validatedId = validateCommentId(id);
        const supabase = await createClient();

        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", validatedId);

        if (error) {
            console.error("Error deleting comment:", error);
            return false;
        }

        return true;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Validation error deleting comment:", error.message);
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error deleting comment:", error);
        return false;
    }
}

// REACTION operations
export async function addCommentReaction(
    reactionData: CreateCommentReactionData
): Promise<CommentReaction | null> {
    try {
        const validatedData = validateCreateCommentReaction(reactionData);
        const supabase = await createClient();

        // First, remove any existing reaction from this user
        await supabase
            .from("comment_reactions")
            .delete()
            .eq("comment_id", validatedData.commentId)
            .eq("user_id", validatedData.userId);

        // Add the new reaction
        const { data, error } = await supabase
            .from("comment_reactions")
            .insert({
                comment_id: validatedData.commentId,
                user_id: validatedData.userId,
                reaction_type: validatedData.reactionType,
            })
            .select(
                `
                *,
                user:users(id, full_name, avatar_url)
            `
            )
            .single();

        if (error) {
            console.error("Error adding comment reaction:", error);
            return null;
        }

        return transformReactionData(data);
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "Validation error adding comment reaction:",
                error.message
            );
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error adding comment reaction:", error);
        return null;
    }
}

export async function removeCommentReaction(
    commentId: number,
    userId: string
): Promise<boolean> {
    try {
        const validatedCommentId = validateCommentId(commentId);
        const supabase = await createClient();

        const { error } = await supabase
            .from("comment_reactions")
            .delete()
            .eq("comment_id", validatedCommentId)
            .eq("user_id", userId);

        if (error) {
            console.error("Error removing comment reaction:", error);
            return false;
        }

        return true;
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "Validation error removing comment reaction:",
                error.message
            );
            throw new Error(`Validation failed: ${error.message}`);
        }
        console.error("Unexpected error removing comment reaction:", error);
        return false;
    }
}

// Helper functions
function transformCommentData(data: any): Comment {
    return {
        id: data.id,
        content: data.content,
        articleId: data.article_id,
        userId: data.user_id,
        parentId: data.parent_id,
        status: data.status,
        isEdited: data.is_edited,
        editReason: data.edit_reason,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        editedAt: data.edited_at,
        moderatedAt: data.moderated_at,
        moderatedBy: data.moderated_by,
        user: data.user
            ? {
                  id: data.user.id,
                  email: data.user.email,
                  fullName: data.user.full_name,
                  avatarUrl: data.user.avatar_url,
              }
            : undefined,
        reactions: data.reactions?.map(transformReactionData) || [],
    };
}

function transformReactionData(data: any): CommentReaction {
    return {
        id: data.id,
        commentId: data.comment_id,
        userId: data.user_id,
        reactionType: data.reaction_type,
        createdAt: data.created_at,
        user: data.user
            ? {
                  id: data.user.id,
                  fullName: data.user.full_name,
                  avatarUrl: data.user.avatar_url,
              }
            : undefined,
    };
}
