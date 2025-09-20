-- Create comment status enum
CREATE TYPE "public"."comment_status" AS ENUM('pending', 'approved', 'rejected', 'spam');

-- Create comments table
CREATE TABLE IF NOT EXISTS "public"."comments" (
	"id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"content" text NOT NULL,
	"article_id" integer NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"parent_id" integer,
	"status" "comment_status" DEFAULT 'pending' NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edit_reason" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited_at" timestamp with time zone,
	"moderated_at" timestamp with time zone,
	"moderated_by" varchar(36),
	CONSTRAINT "comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade,
	CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade,
	CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade
);

-- Create comment reactions table
CREATE TABLE IF NOT EXISTS "public"."comment_reactions" (
	"id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"comment_id" integer NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"reaction_type" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comment_reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade,
	CONSTRAINT "comment_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade
);


-- Create comment mentions table
CREATE TABLE IF NOT EXISTS "public"."comment_mentions" (
	"id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"comment_id" integer NOT NULL,
	"mentioned_user_id" varchar(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comment_mentions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade,
	CONSTRAINT "comment_mentions_mentioned_user_id_users_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "public"."users"("id") ON DELETE cascade
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_comments_article_id" ON "public"."comments" USING btree ("article_id");
CREATE INDEX IF NOT EXISTS "idx_comments_user_id" ON "public"."comments" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_comments_parent_id" ON "public"."comments" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "idx_comments_status" ON "public"."comments" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_comments_created_at" ON "public"."comments" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "idx_comments_article_status" ON "public"."comments" USING btree ("article_id", "status");

CREATE INDEX IF NOT EXISTS "idx_comment_reactions_comment_id" ON "public"."comment_reactions" USING btree ("comment_id");
CREATE INDEX IF NOT EXISTS "idx_comment_reactions_user_id" ON "public"."comment_reactions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_comment_reactions_comment_user" ON "public"."comment_reactions" USING btree ("comment_id", "user_id");


CREATE INDEX IF NOT EXISTS "idx_comment_mentions_comment_id" ON "public"."comment_mentions" USING btree ("comment_id");
CREATE INDEX IF NOT EXISTS "idx_comment_mentions_mentioned_user_id" ON "public"."comment_mentions" USING btree ("mentioned_user_id");

-- Add unique constraint to prevent duplicate reactions from same user
CREATE UNIQUE INDEX IF NOT EXISTS "unique_comment_reaction_user" ON "public"."comment_reactions" ("comment_id", "user_id");

