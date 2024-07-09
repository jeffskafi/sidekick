DO $$ BEGIN
 CREATE TYPE "public"."agent_status" AS ENUM('idle', 'active');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."crew_type" AS ENUM('hierarchical', 'sequential');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'done', 'failed', 'exception');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command-center_agent_skill" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"skill_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "command-center_agent_skill_agent_id_skill_id_unique" UNIQUE("agent_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command-center_agent" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"status" "agent_status" DEFAULT 'idle' NOT NULL,
	"x_position" integer DEFAULT 0 NOT NULL,
	"y_position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command-center_crew_agent" (
	"id" serial PRIMARY KEY NOT NULL,
	"crew_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "command-center_crew_agent_crew_id_agent_id_unique" UNIQUE("crew_id","agent_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command-center_crew" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"type" "crew_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command-center_project" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command-center_skill" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command-center_story" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"crew_id" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command-center_task" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"description" text NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"agent_id" integer,
	"story_id" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_agent_skill" ADD CONSTRAINT "command-center_agent_skill_agent_id_command-center_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."command-center_agent"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_agent_skill" ADD CONSTRAINT "command-center_agent_skill_skill_id_command-center_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."command-center_skill"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_agent" ADD CONSTRAINT "command-center_agent_project_id_command-center_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."command-center_project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_crew_agent" ADD CONSTRAINT "command-center_crew_agent_crew_id_command-center_crew_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."command-center_crew"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_crew_agent" ADD CONSTRAINT "command-center_crew_agent_agent_id_command-center_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."command-center_agent"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_crew" ADD CONSTRAINT "command-center_crew_project_id_command-center_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."command-center_project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_story" ADD CONSTRAINT "command-center_story_project_id_command-center_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."command-center_project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_story" ADD CONSTRAINT "command-center_story_crew_id_command-center_crew_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."command-center_crew"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_task" ADD CONSTRAINT "command-center_task_project_id_command-center_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."command-center_project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_task" ADD CONSTRAINT "command-center_task_agent_id_command-center_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."command-center_agent"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command-center_task" ADD CONSTRAINT "command-center_task_story_id_command-center_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."command-center_story"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_skill_idx" ON "command-center_agent_skill" ("agent_id","skill_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_name_idx" ON "command-center_agent" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_status_idx" ON "command-center_agent" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "crew_agent_idx" ON "command-center_crew_agent" ("crew_id","agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "crew_name_idx" ON "command-center_crew" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skill_name_idx" ON "command-center_skill" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "story_crew_idx" ON "command-center_story" ("crew_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_agent_idx" ON "command-center_task" ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_story_idx" ON "command-center_task" ("story_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_status_idx" ON "command-center_task" ("status");