CREATE TYPE "public"."kz_action_plan_status" AS ENUM('proposed', 'approved', 'executing', 'succeeded', 'partial_failed', 'failed', 'needs_reconciliation', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."kz_action_step_status" AS ENUM('pending', 'running', 'succeeded', 'failed', 'unknown', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."kz_activity_status" AS ENUM('succeeded', 'failed', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."kz_chat_message_role" AS ENUM('user', 'assistant', 'tool');--> statement-breakpoint
CREATE TYPE "public"."kz_connection_provider" AS ENUM('gmail', 'googlecalendar');--> statement-breakpoint
CREATE TYPE "public"."kz_connection_status" AS ENUM('disconnected', 'connecting', 'connected', 'needs_reauth', 'error');--> statement-breakpoint
CREATE TABLE "kz_action_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"status" "kz_action_plan_status" DEFAULT 'proposed' NOT NULL,
	"payload_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kz_action_plans_workspace_id_id_uq" UNIQUE("workspace_id","id"),
	CONSTRAINT "kz_action_plans_revision_positive_chk" CHECK ("kz_action_plans"."revision" >= 1),
	CONSTRAINT "kz_action_plans_approval_fields_pair_chk" CHECK (("kz_action_plans"."approved_by" IS NULL) = ("kz_action_plans"."approved_at" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "kz_action_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"ordinal" integer NOT NULL,
	"kind" text NOT NULL,
	"input" jsonb NOT NULL,
	"status" "kz_action_step_status" DEFAULT 'pending' NOT NULL,
	"idempotency_key" text NOT NULL,
	"provider_reference" text,
	"error_code" text,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kz_action_steps_plan_ordinal_uq" UNIQUE("plan_id","ordinal"),
	CONSTRAINT "kz_action_steps_workspace_idempotency_key_uq" UNIQUE("workspace_id","idempotency_key"),
	CONSTRAINT "kz_action_steps_attempt_count_nonnegative_chk" CHECK ("kz_action_steps"."attempt_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "kz_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"actor_type" text NOT NULL,
	"operation" text NOT NULL,
	"status" "kz_activity_status" NOT NULL,
	"reference_id" text,
	"safe_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kz_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "kz_chat_message_role" NOT NULL,
	"parts" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kz_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"provider" "kz_connection_provider" NOT NULL,
	"corsair_account_id" text,
	"account_label" text,
	"status" "kz_connection_status" DEFAULT 'disconnected' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kz_connections_corsair_account_id_unique" UNIQUE("corsair_account_id"),
	CONSTRAINT "kz_connections_workspace_provider_uq" UNIQUE("workspace_id","provider")
);
--> statement-breakpoint
CREATE TABLE "kz_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kz_conversations_workspace_id_id_uq" UNIQUE("workspace_id","id")
);
--> statement-breakpoint
CREATE TABLE "kz_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_sub" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kz_users_google_sub_uq" UNIQUE("google_sub")
);
--> statement-breakpoint
CREATE TABLE "kz_workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"corsair_tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kz_workspaces_owner_user_id_uq" UNIQUE("owner_user_id"),
	CONSTRAINT "kz_workspaces_corsair_tenant_id_uq" UNIQUE("corsair_tenant_id"),
	CONSTRAINT "kz_workspaces_id_owner_user_id_uq" UNIQUE("id","owner_user_id")
);
--> statement-breakpoint
ALTER TABLE "kz_action_plans" ADD CONSTRAINT "kz_action_plans_workspace_id_kz_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."kz_workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_action_plans" ADD CONSTRAINT "kz_action_plans_approved_by_kz_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."kz_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_action_plans" ADD CONSTRAINT "kz_action_plans_conversation_workspace_fk" FOREIGN KEY ("workspace_id","conversation_id") REFERENCES "public"."kz_conversations"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_action_plans" ADD CONSTRAINT "kz_action_plans_approver_workspace_owner_fk" FOREIGN KEY ("workspace_id","approved_by") REFERENCES "public"."kz_workspaces"("id","owner_user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_action_steps" ADD CONSTRAINT "kz_action_steps_workspace_id_kz_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."kz_workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_action_steps" ADD CONSTRAINT "kz_action_steps_plan_workspace_fk" FOREIGN KEY ("workspace_id","plan_id") REFERENCES "public"."kz_action_plans"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_activity" ADD CONSTRAINT "kz_activity_workspace_id_kz_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."kz_workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_chat_messages" ADD CONSTRAINT "kz_chat_messages_workspace_id_kz_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."kz_workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_chat_messages" ADD CONSTRAINT "kz_chat_messages_conversation_workspace_fk" FOREIGN KEY ("workspace_id","conversation_id") REFERENCES "public"."kz_conversations"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_connections" ADD CONSTRAINT "kz_connections_workspace_id_kz_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."kz_workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_conversations" ADD CONSTRAINT "kz_conversations_workspace_id_kz_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."kz_workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kz_workspaces" ADD CONSTRAINT "kz_workspaces_owner_user_id_kz_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."kz_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kz_action_plans_workspace_status_expires_idx" ON "kz_action_plans" USING btree ("workspace_id","status","expires_at");--> statement-breakpoint
CREATE INDEX "kz_activity_workspace_created_at_idx" ON "kz_activity" USING btree ("workspace_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "kz_chat_messages_workspace_id_idx" ON "kz_chat_messages" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "kz_chat_messages_conversation_created_id_idx" ON "kz_chat_messages" USING btree ("conversation_id","created_at","id");--> statement-breakpoint
CREATE INDEX "kz_conversations_workspace_updated_at_idx" ON "kz_conversations" USING btree ("workspace_id","updated_at" DESC NULLS LAST);