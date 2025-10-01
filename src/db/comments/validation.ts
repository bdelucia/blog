import { z } from "zod";

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
        .trim(),
});

// Schema for comment likes
export const createCommentLikeSchema = z.object({
    commentId: z
        .number()
        .int()
        .positive("Comment ID must be a positive integer"),
    userId: z.string().uuid("User ID must be a valid UUID"),
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
    parentId: z
        .number()
        .int()
        .positive("Parent comment ID must be a positive integer")
        .optional(),
    includeLikes: z.boolean().optional().default(false),
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
        .enum(["created_at", "updated_at"])
        .optional()
        .default("created_at"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Type exports for TypeScript
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CreateCommentLikeInput = z.infer<typeof createCommentLikeSchema>;
export type CommentIdInput = z.infer<typeof commentIdSchema>;
export type CommentQueryInput = z.infer<typeof commentQuerySchema>;

// Base comment type for internal use
export type BaseCommentInput = z.infer<typeof baseCommentSchema>;

// Validation helper functions
export function validateCreateComment(data: unknown): CreateCommentInput {
    return createCommentSchema.parse(data);
}

export function validateUpdateComment(data: unknown): UpdateCommentInput {
    return updateCommentSchema.parse(data);
}

export function validateCreateCommentLike(
    data: unknown
): CreateCommentLikeInput {
    return createCommentLikeSchema.parse(data);
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

export function safeValidateCreateCommentLike(data: unknown) {
    return createCommentLikeSchema.safeParse(data);
}

export function safeValidateCommentId(id: unknown) {
    return commentIdSchema.safeParse(id);
}

export function safeValidateCommentQuery(data: unknown) {
    return commentQuerySchema.safeParse(data);
}
