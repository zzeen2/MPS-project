CREATE TYPE "public"."company_grade" AS ENUM('free', 'standard', 'business');--> statement-breakpoint
CREATE TYPE "public"."reward_status" AS ENUM('pending', 'paid');--> statement-breakpoint
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_category_map" (
	"music_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	CONSTRAINT "music_category_map_pk" PRIMARY KEY("music_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "musics" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"artist" text,
	"lyrics" text,
	"owner_company_id" bigint NOT NULL,
	"duration_sec" integer,
	"cover_image_url" text,
	"stream_endpoint" text,
	"price_per_play" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_plays" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"music_id" bigint NOT NULL,
	"using_company_id" bigint NOT NULL,
	"is_valid_play" boolean DEFAULT false NOT NULL,
	"chain_tx_hash" text,
	"played_at" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE "rewards" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"music_id" bigint NOT NULL,
	"play_id" bigint,
	"amount" numeric NOT NULL,
	"status" "reward_status" DEFAULT 'pending' NOT NULL,
	"payout_tx_hash" text,
	"period" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "music_category_map" ADD CONSTRAINT "music_category_map_music_id_musics_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."musics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_category_map" ADD CONSTRAINT "music_category_map_category_id_music_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."music_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musics" ADD CONSTRAINT "musics_owner_company_id_companies_id_fk" FOREIGN KEY ("owner_company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_plays" ADD CONSTRAINT "music_plays_music_id_musics_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."musics"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_plays" ADD CONSTRAINT "music_plays_using_company_id_companies_id_fk" FOREIGN KEY ("using_company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whitelist_entries" ADD CONSTRAINT "whitelist_entries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whitelist_entries" ADD CONSTRAINT "whitelist_entries_music_id_musics_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."musics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_music_id_musics_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."musics"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_play_id_music_plays_id_fk" FOREIGN KEY ("play_id") REFERENCES "public"."music_plays"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "companies_name_uq" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_business_number_uq" ON "companies" USING btree ("business_number");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_email_uq" ON "companies" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_smart_account_address_uq" ON "companies" USING btree ("smart_account_address");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "music_categories_name_uq" ON "music_categories" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "whitelist_company_music_uq" ON "whitelist_entries" USING btree ("company_id","music_id");