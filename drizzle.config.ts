import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load .env / .env.local for CLI commands (drizzle-kit runs outside Next).
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
