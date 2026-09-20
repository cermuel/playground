ALTER TABLE "admins" RENAME COLUMN "username" TO "email";--> statement-breakpoint
DROP INDEX "admins_username_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "admins_email_idx" ON "admins" USING btree ("email");