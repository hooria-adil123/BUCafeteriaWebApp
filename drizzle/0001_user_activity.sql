CREATE TABLE IF NOT EXISTS "user_activity" (
  "user_id" integer PRIMARY KEY NOT NULL,
  "last_login_at" timestamp,
  CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);
