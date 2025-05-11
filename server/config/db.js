import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require',
  },
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});

export const query = (text, params) => pool.query(text, params);
