import {
    integer,
    pgTable,
    varchar,
    text,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";

// Status enum for article status
export const articleStatusEnum = pgEnum("article_status", [
    "draft",
    "published",
]);

// Articles table
export const articles = pgTable("articles", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary"),
    image: varchar("image", { length: 500 }), // Optional image URL/path
    tags: text("tags").array(), // Array of strings, max 5 tags
    datePosted: timestamp("datePosted", { withTimezone: true }),
    status: articleStatusEnum("status").notNull().default("draft"),
    content: text("content"), // MDX content - text type allows for large content
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    createdAt: timestamp("createdAt", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});
