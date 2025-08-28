CREATE TYPE "public"."company_grade" AS ENUM('free', 'standard', 'business');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'will_upgrade');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"business_number" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"phone" text,
	"grade" "company_grade" DEFAULT 'free' NOT NULL,
	"ceo_name" text,
	"profile_image_url" text,
	"homepage_url" text,
	"smart_account_address" text,
	"api_key_hash" text,
	"max_reward_per_month" numeric(12, 0),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"subscription_status" "subscription_status",
	CONSTRAINT "companies_business_number_format_ck" CHECK ("companies"."business_number" ~ '^[0-9]{3}-[0-9]{2}-[0-9]{5}$')
);
--> statement-breakpoint
CREATE TABLE "row_tags" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	CONSTRAINT "row_tags_type_ck" CHECK ("row_tags"."type" IN ('genre','mood','context'))
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"music_id" bigint NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribe" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"grade" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"monthly_fee" numeric(12, 0),
	"max_plays_per_month" integer,
	"discount_rate" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "music_categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "musics" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"artist" text,
	"lyrics_text" text,
	"lyrics_file" text,
	"duration_sec" integer,
	"cover_image_url" text,
	"stream_endpoint" text,
	"is_valid" boolean,
	"price_per_play" numeric(12, 0),
	"reward_amount" integer,
	"reward_count" integer,
	"category_id" bigint,
	"grade" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"music_id" bigint NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_plays" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"music_id" bigint NOT NULL,
	"company_id" bigint NOT NULL,
	"reward_amount" numeric(12, 0),
	"transaction_hash" text,
	"api_latency" integer,
	"reward_code" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "music_plays_reward_code_ck" CHECK ("music_plays"."reward_code" IN (0, 1, 2, 3))
);
--> statement-breakpoint
CREATE TABLE "whitelist_entries" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"music_id" bigint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deactivated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "admin" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_numbers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"number" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_music_id_musics_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."musics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscribe" ADD CONSTRAINT "subscribe_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "musics" ADD CONSTRAINT "musics_category_id_music_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."music_categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_music_id_musics_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."musics"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "music_plays" ADD CONSTRAINT "music_plays_music_id_musics_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."musics"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "music_plays" ADD CONSTRAINT "music_plays_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "whitelist_entries" ADD CONSTRAINT "whitelist_entries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "whitelist_entries" ADD CONSTRAINT "whitelist_entries_music_id_musics_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."musics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "business_numbers" ADD CONSTRAINT "business_numbers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "companies_name_uq" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_business_number_uq" ON "companies" USING btree ("business_number");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_email_uq" ON "companies" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_smart_account_address_uq" ON "companies" USING btree ("smart_account_address");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_api_key_hash_uq" ON "companies" USING btree ("api_key_hash");--> statement-breakpoint
CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "companies_grade_idx" ON "companies" USING btree ("grade");--> statement-breakpoint
CREATE INDEX "companies_subscription_status_idx" ON "companies" USING btree ("subscription_status");--> statement-breakpoint
CREATE UNIQUE INDEX "row_tags_slug_uq" ON "row_tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "row_tags_name_idx" ON "row_tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tags_music_id_idx" ON "tags" USING btree ("music_id");--> statement-breakpoint
CREATE INDEX "tags_music_id_created_at_idx" ON "tags" USING btree ("music_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "subscribe_company_id_uq" ON "subscribe" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "music_categories_name_uq" ON "music_categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "musics_title_idx" ON "musics" USING btree ("title");--> statement-breakpoint
CREATE INDEX "musics_created_at_idx" ON "musics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "playlists_company_id_idx" ON "playlists" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "playlists_music_id_idx" ON "playlists" USING btree ("music_id");--> statement-breakpoint
CREATE UNIQUE INDEX "playlists_company_id_name_uq" ON "playlists" USING btree ("company_id","name");--> statement-breakpoint
CREATE INDEX "music_plays_music_id_idx" ON "music_plays" USING btree ("music_id");--> statement-breakpoint
CREATE INDEX "music_plays_company_id_idx" ON "music_plays" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "music_plays_created_at_idx" ON "music_plays" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "music_plays_reward_code_idx" ON "music_plays" USING btree ("reward_code");--> statement-breakpoint
CREATE UNIQUE INDEX "whitelist_company_id_music_id_uq" ON "whitelist_entries" USING btree ("company_id","music_id");--> statement-breakpoint
CREATE INDEX "whitelist_company_id_idx" ON "whitelist_entries" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "whitelist_music_id_idx" ON "whitelist_entries" USING btree ("music_id");--> statement-breakpoint
CREATE UNIQUE INDEX "business_numbers_company_id_number_uq" ON "business_numbers" USING btree ("company_id","number");