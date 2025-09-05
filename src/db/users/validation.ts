import { z } from "zod";

// User role validation
export const userRoleSchema = z.enum(["admin", "user"]);

// Base user validation schema
const baseUserSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .max(255, "Email must be less than 255 characters"),
    fullName: z
        .string()
        .max(255, "Full name must be less than 255 characters")
        .optional(),
    avatarUrl: z
        .string()
        .url("Avatar URL must be a valid URL")
        .max(500, "Avatar URL must be less than 500 characters")
        .optional(),
    role: userRoleSchema.optional(),
});

// Schema for creating users
export const createUserSchema = baseUserSchema.extend({
    id: z.string().uuid("User ID must be a valid UUID"),
    email: z
        .string()
        .email("Invalid email address")
        .max(255, "Email must be less than 255 characters"),
});

// Schema for updating users
export const updateUserSchema = baseUserSchema.partial().extend({
    id: z.string().uuid("User ID must be a valid UUID").optional(),
});

// Schema for user profiles
export const userProfileSchema = z.object({
    id: z.string().uuid("User ID must be a valid UUID"),
    bio: z
        .string()
        .max(1000, "Bio must be less than 1000 characters")
        .optional(),
    website: z
        .string()
        .url("Website must be a valid URL")
        .max(255, "Website URL must be less than 255 characters")
        .optional(),
    location: z
        .string()
        .max(255, "Location must be less than 255 characters")
        .optional(),
    twitterHandle: z
        .string()
        .max(50, "Twitter handle must be less than 50 characters")
        .optional(),
    githubHandle: z
        .string()
        .max(50, "GitHub handle must be less than 50 characters")
        .optional(),
});

// Schema for updating user profiles
export const updateUserProfileSchema = userProfileSchema.partial().extend({
    id: z.string().uuid("User ID must be a valid UUID").optional(),
});

// Schema for validating user IDs
export const userIdSchema = z.string().uuid("User ID must be a valid UUID");

// Schema for validating emails
export const emailSchema = z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters");

// Type exports for TypeScript
export type UserRole = z.infer<typeof userRoleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type EmailInput = z.infer<typeof emailSchema>;

// Validation helper functions
export function validateCreateUser(data: unknown): CreateUserInput {
    return createUserSchema.parse(data);
}

export function validateUpdateUser(data: unknown): UpdateUserInput {
    return updateUserSchema.parse(data);
}

export function validateUserProfile(data: unknown): UserProfileInput {
    return userProfileSchema.parse(data);
}

export function validateUpdateUserProfile(
    data: unknown
): UpdateUserProfileInput {
    return updateUserProfileSchema.parse(data);
}

export function validateUserId(id: unknown): UserIdInput {
    return userIdSchema.parse(id);
}

export function validateEmail(email: unknown): EmailInput {
    return emailSchema.parse(email);
}

export function validateUserRole(role: unknown): UserRole {
    return userRoleSchema.parse(role);
}

// Safe validation functions that return results instead of throwing
export function safeValidateCreateUser(data: unknown) {
    return createUserSchema.safeParse(data);
}

export function safeValidateUpdateUser(data: unknown) {
    return updateUserSchema.safeParse(data);
}

export function safeValidateUserProfile(data: unknown) {
    return userProfileSchema.safeParse(data);
}

export function safeValidateUpdateUserProfile(data: unknown) {
    return updateUserProfileSchema.safeParse(data);
}

export function safeValidateUserId(id: unknown) {
    return userIdSchema.safeParse(id);
}

export function safeValidateEmail(email: unknown) {
    return emailSchema.safeParse(email);
}

export function safeValidateUserRole(role: unknown) {
    return userRoleSchema.safeParse(role);
}
