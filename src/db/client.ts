import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Drizzle client over Neon's serverless HTTP driver. DATABASE_URL is read from
 * the environment (the only active secret in this project). Import lazily so
 * pure modules (money, order-state, seed-data) and their tests never require a
 * connection string.
 */
let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. It is required for database access (migrations, seed, runtime queries).",
    );
  }
  const sql = neon(url);
  cached = drizzle(sql, { schema });
  return cached;
}

export { schema };
