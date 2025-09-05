import { pgTable, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// User role enum
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

// Users table
export const users = pgTable("users", {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID from Supabase auth
    email: varchar("email", { length: 255 }).notNull().unique(),
    fullName: varchar("full_name", { length: 255 }),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    role: userRoleEnum("role").notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// User profiles table (optional additional user data)
export const userProfiles = pgTable("user_profiles", {
    id: varchar("id", { length: 36 }).primaryKey(), // References users.id
    bio: text("bio"),
    website: varchar("website", { length: 255 }),
    location: varchar("location", { length: 255 }),
    twitterHandle: varchar("twitter_handle", { length: 50 }),
    githubHandle: varchar("github_handle", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
