export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const value = env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");
  if (value) return value;

  throw new Error("Database connection string is missing. Set DATABASE_URL.");
}
