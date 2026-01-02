CREATE TABLE "llm_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"model_id" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"input_cost_per_1k" numeric(10, 6),
	"output_cost_per_1k" numeric(10, 6),
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "llm_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"logo_url" text,
	"encrypted_api_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role" SET DEFAULT 'super_admin'::text;--> statement-breakpoint
DROP TYPE "public"."admin_role";--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('super_admin');--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role" SET DEFAULT 'super_admin'::"public"."admin_role";--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role" SET DATA TYPE "public"."admin_role" USING "role"::"public"."admin_role";--> statement-breakpoint
ALTER TABLE "llm_models" ADD CONSTRAINT "llm_models_provider_id_llm_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."llm_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "llm_models_provider_model_idx" ON "llm_models" USING btree ("provider_id","model_id");--> statement-breakpoint
CREATE UNIQUE INDEX "llm_providers_name_idx" ON "llm_providers" USING btree ("name");