#!/usr/bin/env node

import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

const EMAIL = process.env.OWNER_EMAIL || "dr@keshevplus.co.il";
const PASSWORD = process.env.OWNER_PASSWORD || "12345678";

const DATABASE_URL_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "KESHEVPLUS_POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "KESHEVPLUS_POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "KESHEVPLUS_POSTGRES_URL_NON_POOLING",
  "KESHEVPLUS_DATABASE_URL",
];

function getDatabaseUrl() {
  for (const key of DATABASE_URL_ENV_KEYS) {
    const value = process.env[key]?.trim().replace(/^['"]|['"]$/g, "");
    if (value) return value;
  }
  throw new Error(`Missing database URL. Set one of: ${DATABASE_URL_ENV_KEYS.join(", ")}`);
}

async function seedOwnerRole() {
  const pool = new Pool({ connectionString: getDatabaseUrl() });

  try {
    console.log("Seeding owner role...");

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [EMAIL]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE users SET role = $1, password = $2, must_change_password = $3 WHERE email = $4",
        ["owner", hashedPassword, true, EMAIL]
      );
      console.log(`Updated existing user ${EMAIL} to owner role`);
    } else {
      await pool.query(
        "INSERT INTO users (email, password, role, must_change_password) VALUES ($1, $2, $3, $4)",
        [EMAIL, hashedPassword, "owner", true]
      );
      console.log(`Created owner user: ${EMAIL}`);
    }

    console.log("Owner role seeded successfully.");
    console.log("  Email:", EMAIL);
    console.log("  Role: owner (admin-equivalent permissions)");
    console.log("  Must change password on first login: yes");
  } catch (error) {
    console.error("Failed to seed owner role:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedOwnerRole();
