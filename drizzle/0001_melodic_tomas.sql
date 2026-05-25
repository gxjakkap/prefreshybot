CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);

ALTER TABLE "teams" ALTER COLUMN "head_role_id" SET NOT NULL;