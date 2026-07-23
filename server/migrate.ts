import { pool } from "./db";

// Runs on every boot (local, Replit, and each Vercel cold start). Kept to
// idempotent "create if missing" DDL so a fresh clone of this template needs
// no manual migration step beyond setting DATABASE_URL.
export async function ensureSchema(): Promise<void> {
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS first_name text,
      ADD COLUMN IF NOT EXISTS last_name text,
      ADD COLUMN IF NOT EXISTS phone text,
      ADD COLUMN IF NOT EXISTS profile_image_url text,
      ADD COLUMN IF NOT EXISTS created_at timestamp NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now()
  `);

  await pool.query(`
    ALTER TABLE client_activities
      ADD COLUMN IF NOT EXISTS actor_user_id integer,
      ADD COLUMN IF NOT EXISTS actor_email text,
      ADD COLUMN IF NOT EXISTS actor_name text,
      ADD COLUMN IF NOT EXISTS actor_role text,
      ADD COLUMN IF NOT EXISTS actor_profile_image_url text
  `);

  await pool.query(`
    ALTER TABLE client_files
      ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id serial PRIMARY KEY,
      actor_user_id integer,
      actor_email text,
      actor_name text,
      actor_role text,
      actor_profile_image_url text,
      action text NOT NULL,
      entity_type text NOT NULL,
      entity_id integer,
      entity_label text,
      description text NOT NULL,
      metadata jsonb,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs (created_at DESC)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS activity_logs_actor_user_id_idx ON activity_logs (actor_user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS activity_logs_entity_idx ON activity_logs (entity_type, entity_id)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS images (
      id serial PRIMARY KEY,
      slot text NOT NULL UNIQUE,
      mime_type text NOT NULL,
      filename text,
      data text NOT NULL,
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);
}
