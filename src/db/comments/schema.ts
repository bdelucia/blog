import {
    integer,
    pgTable,
    varchar,
    text,
    timestamp,
    pgEnum,
    boolean,
} from "drizzle-orm/pg-core";
import { articles } from "../articles/schema";
import { users } from "../users/schema";

// Comment status enum for moderation
export const commentStatusEnum = pgEnum("comment_status", [
    "pending", // Awaiting moderation
    "approved", // Published and visible
    "rejected", // Rejected by moderator
    "spam", // Marked as spam
]);

// Comments table
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
    }), // For nested comments

    // Moderation
    status: commentStatusEnum("status").notNull().default("pending"),
    isEdited: boolean("is_edited").notNull().default(false),
    editReason: text("edit_reason"), // Reason for editing (if any)

    // Metadata
    ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
    userAgent: text("user_agent"), // Browser info for moderation

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    editedAt: timestamp("edited_at", { withTimezone: true }), // When it was last edited
    moderatedAt: timestamp("moderated_at", { withTimezone: true }), // When it was moderated
    moderatedBy: varchar("moderated_by", { length: 36 }), // ID of the moderator
});

// Comment reactions/likes table
export const commentReactions = pgTable("comment_reactions", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    commentId: integer("comment_id")
        .notNull()
        .references(() => comments.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    reactionType: varchar("reaction_type", { length: 20 }).notNull(), // 'like', 'dislike', 'love', etc.
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// Comment mentions table (when users mention other users)
export const commentMentions = pgTable("comment_mentions", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    commentId: integer("comment_id")
        .notNull()
        .references(() => comments.id, { onDelete: "cascade" }),
    mentionedUserId: varchar("mentioned_user_id", { length: 36 })
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
    status: "idx_comments_status",
    createdAt: "idx_comments_created_at",
    articleStatus: "idx_comments_article_status", // Composite index for article + status
};

export const commentReactionsIndexes = {
    commentId: "idx_comment_reactions_comment_id",
    userId: "idx_comment_reactions_user_id",
    commentUser: "idx_comment_reactions_comment_user", // Composite index for comment + user
};

export const commentMentionsIndexes = {
    commentId: "idx_comment_mentions_comment_id",
    mentionedUserId: "idx_comment_mentions_mentioned_user_id",
};
