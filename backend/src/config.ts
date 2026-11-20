import dotenv from "dotenv";
import { randomBytes } from "node:crypto";
import { join, resolve } from "node:path";

const projectRoot = join(__dirname, "..", "..");

dotenv.config({ path: join(projectRoot, ".env") });
dotenv.config({ path: join(__dirname, "..", ".env") });

function int(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(value: string | undefined): boolean {
  return String(value ?? "").toLowerCase() === "true";
}

export interface AppConfig {
  port: number;
  dbPath: string;
  sessionSecret: string;
  adminEmail: string;
  adminPasswordHash: string;
  cookieSecure: boolean;
  generatedDir: string;
  frontendDist: string;
}

const WEAK_SECRETS = new Set([
  "",
  "replace-with-a-long-random-string",
  "changeme",
  "change-me",
  "secret",
]);

const configuredSecret = process.env.SESSION_SECRET?.trim() ?? "";
const weakSecret = WEAK_SECRETS.has(configuredSecret.toLowerCase()) || configuredSecret.length < 32;

if (process.env.NODE_ENV === "production") {
  if (weakSecret) {
    throw new Error(
      "SESSION_SECRET must be a random string of at least 32 characters in production. " +
        "Run: npm run setup:admin",
    );
  }
  if (!(process.env.ADMIN_EMAIL || "").trim()) {
    throw new Error("ADMIN_EMAIL must be configured in production. Run: npm run setup:admin");
  }
} else if (weakSecret && process.env.NODE_ENV !== "test") {
  console.warn(
    "[zentry] SESSION_SECRET is missing or weak. Using an ephemeral secret; sessions reset on restart. " +
      "Run: npm run setup:admin for persistent login.",
  );
}

export const config: AppConfig = {
  port: int(process.env.PORT, 3001),
  dbPath: resolve(projectRoot, process.env.DB_PATH || "./backend/data/zentry.db"),
  sessionSecret: weakSecret ? randomBytes(32).toString("hex") : configuredSecret,
  adminEmail: (process.env.ADMIN_EMAIL || "").toLowerCase(),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
  cookieSecure: bool(process.env.COOKIE_SECURE),
  generatedDir: join(projectRoot, "generated"),
  frontendDist: join(projectRoot, "frontend", "dist"),
};

export const SESSION_COOKIE = "zentry_admin";
