CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE TABLE "infinite_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" text NOT NULL,
	"description" text,
	"location_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "infinite_images" ADD CONSTRAINT "infinite_images_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "infinite_images_deleted_at_idx" ON "infinite_images" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "infinite_images_location_id_idx" ON "infinite_images" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "infinite_images_created_at_idx" ON "infinite_images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "locations_deleted_at_idx" ON "locations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "locations_name_idx" ON "locations" USING btree ("name");
