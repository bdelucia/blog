import {
    integer,
    pgTable,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { articles } from "../articles/schema";
import { users } from "../users/schema";

// Simplified comments table - barebones version
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const comments: any = pgTable("comments", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    // Content
    content: text("content").notNull(),

    // Relationships
    articleId: integer("article_id")
        .notNull()
        .references(() => articles.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    parentId: integer("parent_id").references(() => comments.id, {
        onDelete: "cascade",
    }), // For nested comments/replies

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// Comment likes table
export const commentLikes = pgTable("comment_likes", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    commentId: integer("comment_id")
        .notNull()
        .references(() => comments.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// Indexes for better performance
export const commentsIndexes = {
    articleId: "idx_comments_article_id",
    userId: "idx_comments_user_id",
    parentId: "idx_comments_parent_id",
    createdAt: "idx_comments_created_at",
};

export const commentLikesIndexes = {
    commentId: "idx_comment_likes_comment_id",
    userId: "idx_comment_likes_user_id",
    commentUser: "idx_comment_likes_comment_user", // Composite index
};
