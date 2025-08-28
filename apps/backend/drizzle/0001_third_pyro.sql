CREATE TYPE "public"."reward_code" AS ENUM('0', '1', '2', '3');--> statement-breakpoint
CREATE TYPE "public"."use_case" AS ENUM('0', '1', '2');--> statement-breakpoint
CREATE TABLE "business_numbers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"number" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_subscriptions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"tier" varchar(20) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"monthly_fee" numeric(10, 2) NOT NULL,
	"status" varchar(20) NOT NULL,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"payment_status" varchar(20),
	"total_paid_amount" numeric(10, 2),
	"payment_count" integer,
	"discount_amount" numeric(10, 2),
	"actual_paid_amount" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "music_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"music_id" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "raw_tags" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	CONSTRAINT "raw_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscription_settings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"tier" varchar(20) NOT NULL,
	"monthly_fee" numeric(10, 2) NOT NULL,
	"annual_discount_rate" numeric(5, 2) DEFAULT '0',
	"max_api_calls_per_month" integer,
	"max_rewards_per_month" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "music_embeddings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"music_id" integer NOT NULL,
	"kind" text,
	"model" text,
	"dim" integer,
	"embedding" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "music_category_map" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "whitelist_entries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
DROP TABLE "music_category_map" CASCADE;--> statement-breakpoint
DROP TABLE "whitelist_entries" CASCADE;--> statement-breakpoint
ALTER TABLE "musics" DROP CONSTRAINT "musics_owner_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "music_plays" DROP CONSTRAINT "music_plays_music_id_musics_id_fk";
--> statement-breakpoint
ALTER TABLE "music_plays" DROP CONSTRAINT "music_plays_using_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "rewards" DROP CONSTRAINT "rewards_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "rewards" DROP CONSTRAINT "rewards_music_id_musics_id_fk";
--> statement-breakpoint
ALTER TABLE "rewards" DROP CONSTRAINT "rewards_play_id_music_plays_id_fk";
--> statement-breakpoint
DROP INDEX "companies_name_uq";--> statement-breakpoint
DROP INDEX "companies_business_number_uq";--> statement-breakpoint
DROP INDEX "companies_email_uq";--> statement-breakpoint
DROP INDEX "companies_smart_account_address_uq";--> statement-breakpoint
DROP INDEX "music_categories_name_uq";--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "musics" ALTER COLUMN "artist" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "musics" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "musics" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "music_plays" ALTER COLUMN "is_valid_play" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "music_plays" ALTER COLUMN "is_valid_play" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "music_plays" ALTER COLUMN "played_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "music_plays" ALTER COLUMN "played_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rewards" ALTER COLUMN "play_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rewards" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rewards" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "lyrics_text" text;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "lyrics_file" text;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "release_date" date;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "lyrics_price" numeric;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "reward_amount" integer;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "reward_count" integer;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "genre" varchar(100);--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "grade" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "play_count" bigint DEFAULT 0;--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "total_revenue" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "musics" ADD COLUMN "last_played_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "playlists" ADD COLUMN "music_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "music_plays" ADD COLUMN "reward_amount" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "music_plays" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "music_plays" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "music_plays" ADD COLUMN "transaction_hash" text;--> statement-breakpoint
ALTER TABLE "music_plays" ADD COLUMN "api_latency" integer;--> statement-breakpoint
ALTER TABLE "music_plays" ADD COLUMN "reward_code" "reward_code" NOT NULL;--> statement-breakpoint
ALTER TABLE "music_plays" ADD COLUMN "use_case" "use_case" NOT NULL;--> statement-breakpoint
ALTER TABLE "music_plays" ADD COLUMN "use_price" numeric;--> statement-breakpoint
ALTER TABLE "music_plays" ADD COLUMN "playlist_id" bigint;--> statement-breakpoint
ALTER TABLE "music_plays" ADD COLUMN "play_duration_sec" integer;--> statement-breakpoint
ALTER TABLE "musics" DROP COLUMN "lyrics";--> statement-breakpoint
ALTER TABLE "musics" DROP COLUMN "owner_company_id";--> statement-breakpoint
ALTER TABLE "music_plays" DROP COLUMN "chain_tx_hash";--> statement-breakpoint
ALTER TABLE "rewards" DROP COLUMN "period";--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_business_number_unique" UNIQUE("business_number");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_smart_account_address_unique" UNIQUE("smart_account_address");--> statement-breakpoint
ALTER TABLE "music_categories" ADD CONSTRAINT "music_categories_name_unique" UNIQUE("name");