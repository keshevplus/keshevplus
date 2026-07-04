const DATABASE_URL_ENV_KEYS = [
  "KESHEVPLUS_POSTGRES_URL",
  "KESHEVPLUS_POSTGRES_PRISMA_URL",
  "KESHEVPLUS_POSTGRES_URL_NON_POOLING",
  "KESHEVPLUS_DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
] as const;

export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  for (const key of DATABASE_URL_ENV_KEYS) {
    const value = env[key]?.trim().replace(/^['"]|['"]$/g, "");
    if (value) return value;
  }

  throw new Error(
    `Database connection string is missing. Set one of: ${DATABASE_URL_ENV_KEYS.join(", ")}`,
  );
}
