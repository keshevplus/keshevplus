import { pool } from "./db";

// Runs on every boot (local, Replit, and each Vercel cold start). Kept to
// idempotent "create if missing" DDL so a fresh clone of this template needs
// no manual migration step beyond setting DATABASE_URL.
export async function ensureSchema(): Promise<void> {
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
