import { z } from "zod";

// Comment status validation
export const commentStatusSchema = z.enum([
    "pending",
    "approved",
    "rejected",
    "spam",
]);

// Reaction type validation
export const reactionTypeSchema = z.enum([
    "like",
    "dislike",
    "love",
    "laugh",
    "angry",
    "sad",
    "wow",
]);

// Base comment validation schema
const baseCommentSchema = z.object({
    content: z
        .string()
        .min(1, "Comment content is required")
        .max(2000, "Comment must be less than 2000 characters")
        .trim(),
    articleId: z
        .number()
        .int()
        .positive("Article ID must be a positive integer"),
    parentId: z
        .number()
        .int()
        .positive("Parent comment ID must be a positive integer")
        .optional(),
    ipAddress: z.string().optional(),
    userAgent: z
        .string()
        .max(500, "User agent must be less than 500 characters")
        .optional(),
});

// Schema for creating comments
export const createCommentSchema = baseCommentSchema.extend({
    userId: z.string().uuid("User ID must be a valid UUID"),
});

// Schema for updating comments
export const updateCommentSchema = z.object({
    content: z
        .string()
        .min(1, "Comment content is required")
        .max(2000, "Comment must be less than 2000 characters")
        .trim()
        .optional(),
    editReason: z
        .string()
        .max(200, "Edit reason must be less than 200 characters")
        .optional(),
});

// Schema for moderating comments
export const moderateCommentSchema = z.object({
    status: commentStatusSchema,
    moderatedBy: z.string().uuid("Moderator ID must be a valid UUID"),
});

// Schema for comment reactions
export const createCommentReactionSchema = z.object({
    commentId: z
        .number()
        .int()
        .positive("Comment ID must be a positive integer"),
    userId: z.string().uuid("User ID must be a valid UUID"),
    reactionType: reactionTypeSchema,
});

// Schema for comment mentions
export const createCommentMentionSchema = z.object({
    commentId: z
        .number()
        .int()
        .positive("Comment ID must be a positive integer"),
    mentionedUserId: z.string().uuid("Mentioned user ID must be a valid UUID"),
});

// Schema for validating comment IDs
export const commentIdSchema = z
    .number()
    .int()
    .positive("Comment ID must be a positive integer");

// Schema for comment queries/filters
export const commentQuerySchema = z.object({
    articleId: z
        .number()
        .int()
        .positive("Article ID must be a positive integer")
        .optional(),
    userId: z.string().uuid("User ID must be a valid UUID").optional(),
    status: commentStatusSchema.optional(),
    parentId: z
        .number()
        .int()
        .positive("Parent comment ID must be a positive integer")
        .optional(),
    includeReactions: z.boolean().optional().default(false),
    includeMentions: z.boolean().optional().default(false),
    limit: z
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit must be at most 100")
        .optional()
        .default(20),
    offset: z
        .number()
        .int()
        .min(0, "Offset must be non-negative")
        .optional()
        .default(0),
    sortBy: z
        .enum(["created_at", "updated_at", "reactions"])
        .optional()
        .default("created_at"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Type exports for TypeScript
export type CommentStatus = z.infer<typeof commentStatusSchema>;
export type ReactionType = z.infer<typeof reactionTypeSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;
export type CreateCommentReactionInput = z.infer<
    typeof createCommentReactionSchema
>;
export type CreateCommentMentionInput = z.infer<
    typeof createCommentMentionSchema
>;
export type CommentIdInput = z.infer<typeof commentIdSchema>;
export type CommentQueryInput = z.infer<typeof commentQuerySchema>;

// Validation helper functions
export function validateCreateComment(data: unknown): CreateCommentInput {
    return createCommentSchema.parse(data);
}

export function validateUpdateComment(data: unknown): UpdateCommentInput {
    return updateCommentSchema.parse(data);
}

export function validateModerateComment(data: unknown): ModerateCommentInput {
    return moderateCommentSchema.parse(data);
}

export function validateCreateCommentReaction(
    data: unknown
): CreateCommentReactionInput {
    return createCommentReactionSchema.parse(data);
}

export function validateCreateCommentMention(
    data: unknown
): CreateCommentMentionInput {
    return createCommentMentionSchema.parse(data);
}

export function validateCommentId(id: unknown): CommentIdInput {
    return commentIdSchema.parse(id);
}

export function validateCommentQuery(data: unknown): CommentQueryInput {
    return commentQuerySchema.parse(data);
}

// Safe validation functions that return results instead of throwing
export function safeValidateCreateComment(data: unknown) {
    return createCommentSchema.safeParse(data);
}

export function safeValidateUpdateComment(data: unknown) {
    return updateCommentSchema.safeParse(data);
}

export function safeValidateModerateComment(data: unknown) {
    return moderateCommentSchema.safeParse(data);
}

export function safeValidateCreateCommentReaction(data: unknown) {
    return createCommentReactionSchema.safeParse(data);
}

export function safeValidateCreateCommentMention(data: unknown) {
    return createCommentMentionSchema.safeParse(data);
}

export function safeValidateCommentId(id: unknown) {
    return commentIdSchema.safeParse(id);
}

export function safeValidateCommentQuery(data: unknown) {
    return commentQuerySchema.safeParse(data);
}
