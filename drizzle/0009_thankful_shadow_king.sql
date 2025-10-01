CREATE TABLE "comment_likes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "comment_likes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"comment_id" integer NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "comment_mentions" CASCADE;--> statement-breakpoint
DROP TABLE "comment_reactions" CASCADE;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "is_edited";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "edit_reason";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "user_agent";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "edited_at";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "moderated_at";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "moderated_by";--> statement-breakpoint
DROP TYPE "public"."comment_status";