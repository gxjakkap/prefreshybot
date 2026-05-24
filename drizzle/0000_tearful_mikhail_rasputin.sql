CREATE TABLE "staffs" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"name" text NOT NULL,
	"nickname" text NOT NULL,
	"year" integer NOT NULL,
	"team" text NOT NULL,
	"user_id" text,
	CONSTRAINT "staffs_student_id_unique" UNIQUE("student_id"),
	CONSTRAINT "staffs_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"slug" text NOT NULL,
	"role_id" text NOT NULL,
	CONSTRAINT "teams_slug_unique" UNIQUE("slug"),
	CONSTRAINT "teams_role_id_unique" UNIQUE("role_id")
);
