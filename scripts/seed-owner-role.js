#!/usr/bin/env node

const { Pool } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");

const EMAIL = process.env.OWNER_EMAIL || "dr@keshevplus.co.il";
const PASSWORD = process.env.OWNER_PASSWORD || "12345678";

async function seedOwnerRole() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
