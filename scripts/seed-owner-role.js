#!/usr/bin/env node

import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

const EMAILS = (process.env.OWNER_EMAILS || process.env.OWNER_EMAIL || "dr@keshevplus.co.il,office@keshevplus.co.il,pluskeshev@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const PASSWORD = process.env.OWNER_PASSWORD || "12345678";
const ROLE = process.env.OWNER_ROLE || "superadmin";

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");
  if (value) return value;
  throw new Error("Missing database URL. Set DATABASE_URL.");
}

async function seedOwnerRole() {
  const pool = new Pool({ connectionString: getDatabaseUrl() });

  try {
    console.log("Seeding owner role...");

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    for (const email of EMAILS) {
      const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          "UPDATE users SET role = $1 WHERE email = $2",
          [ROLE, email]
        );
        console.log(`Updated existing user ${email} to ${ROLE} role without changing password`);
      } else {
        await pool.query(
          "INSERT INTO users (email, password, role, must_change_password) VALUES ($1, $2, $3, $4)",
          [email, hashedPassword, ROLE, true]
        );
        console.log(`Created ${ROLE} user: ${email}`);
      }
    }

    console.log("Owner/superadmin roles seeded successfully.");
    console.log("  Emails:", EMAILS.join(", "));
    console.log("  Role:", ROLE);
    console.log("  Must change password on first login: yes");
  } catch (error) {
    console.error("Failed to seed owner role:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedOwnerRole();
