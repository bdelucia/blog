import { z } from "zod";

// Base article validation schema
const baseArticleSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(255, "Title must be less than 255 characters"),
    summary: z
        .string()
        .max(1000, "Summary must be less than 1000 characters")
        .optional(),
    image: z
        .string()
        .url("Image must be a valid URL")
        .max(500, "Image URL must be less than 500 characters")
        .optional(),
    tags: z
        .array(
            z
                .string()
                .min(1, "Tag cannot be empty")
                .max(50, "Tag must be less than 50 characters")
        )
        .max(5, "Maximum 5 tags allowed")
        .optional(),
    datePosted: z
        .string()
        .datetime("Date posted must be a valid ISO datetime")
        .optional(),
    status: z.enum(["draft", "published"]).optional(),
    content: z
        .string()
        .max(100000, "Content must be less than 100,000 characters")
        .optional(),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(255, "Slug must be less than 255 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must contain only lowercase letters, numbers, and hyphens"
        )
        .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), {
            message: "Slug cannot start or end with a hyphen",
        }),
});

// Schema for creating articles
export const createArticleSchema = baseArticleSchema.extend({
    title: z
        .string()
        .min(1, "Title is required")
        .max(255, "Title must be less than 255 characters"),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(255, "Slug must be less than 255 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must contain only lowercase letters, numbers, and hyphens"
        )
        .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), {
            message: "Slug cannot start or end with a hyphen",
        }),
});

// Schema for updating articles (all fields optional except slug validation)
export const updateArticleSchema = baseArticleSchema.partial().extend({
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(255, "Slug must be less than 255 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must contain only lowercase letters, numbers, and hyphens"
        )
        .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), {
            message: "Slug cannot start or end with a hyphen",
        })
        .optional(),
});

// Schema for validating article IDs
export const articleIdSchema = z
    .number()
    .int()
    .positive("Article ID must be a positive integer");

// Schema for validating slugs
export const slugSchema = z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(
        /^[a-z0-9-]+$/,
        "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), {
        message: "Slug cannot start or end with a hyphen",
    });

// Schema for validating tag arrays
export const tagsSchema = z
    .array(
        z
            .string()
            .min(1, "Tag cannot be empty")
            .max(50, "Tag must be less than 50 characters")
    )
    .max(5, "Maximum 5 tags allowed");

// Schema for validating status changes
export const statusSchema = z.enum(["draft", "published"]);

// Type exports for TypeScript
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleIdInput = z.infer<typeof articleIdSchema>;
export type SlugInput = z.infer<typeof slugSchema>;
export type TagsInput = z.infer<typeof tagsSchema>;
export type StatusInput = z.infer<typeof statusSchema>;

// Validation helper functions
export function validateCreateArticle(data: unknown): CreateArticleInput {
    return createArticleSchema.parse(data);
}

export function validateUpdateArticle(data: unknown): UpdateArticleInput {
    return updateArticleSchema.parse(data);
}

export function validateArticleId(id: unknown): ArticleIdInput {
    return articleIdSchema.parse(id);
}

export function validateSlug(slug: unknown): SlugInput {
    return slugSchema.parse(slug);
}

export function validateTags(tags: unknown): TagsInput {
    return tagsSchema.parse(tags);
}

export function validateStatus(status: unknown): StatusInput {
    return statusSchema.parse(status);
}

// Safe validation functions that return results instead of throwing
export function safeValidateCreateArticle(data: unknown) {
    return createArticleSchema.safeParse(data);
}

export function safeValidateUpdateArticle(data: unknown) {
    return updateArticleSchema.safeParse(data);
}

export function safeValidateArticleId(id: unknown) {
    return articleIdSchema.safeParse(id);
}

export function safeValidateSlug(slug: unknown) {
    return slugSchema.safeParse(slug);
}

export function safeValidateTags(tags: unknown) {
    return tagsSchema.safeParse(tags);
}

export function safeValidateStatus(status: unknown) {
    return statusSchema.safeParse(status);
}
