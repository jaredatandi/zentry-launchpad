import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { hashPassword } from "../auth";
import { config } from "../config";

const email = (process.argv[2] || config.adminEmail).toLowerCase();
const password = process.env.ADMIN_PASSWORD || process.argv[3];

if (!password || password.length < 12) {
  console.error(
    "Usage: npm run setup:admin -- you@example.com 'a-long-password'\n" +
      "  (or set ADMIN_PASSWORD in the environment). Minimum 12 characters.",
  );
  process.exit(1);
}

async function main(): Promise<void> {
  const hash = await hashPassword(password!);
  const envPath = join(__dirname, "..", "..", "..", ".env");
  const values: Record<string, string> = {
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD_HASH: hash,
  };

  let lines: string[] = [];
  if (existsSync(envPath)) lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  const seen = new Set<string>();
  lines = lines.map((line) => {
    const key = line.match(/^([A-Z_]+)=/)?.[1];
    if (!key || !(key in values)) return line;
    seen.add(key);
    return `${key}=${values[key]}`;
  });
  for (const [key, value] of Object.entries(values)) {
    if (!seen.has(key)) lines.push(`${key}=${value}`);
  }
  const weakSecrets = new Set(["", "replace-with-a-long-random-string", "changeme", "change-me", "secret"]);
  const secretLine = lines.find((line) => line.startsWith("SESSION_SECRET="));
  const currentSecret = (secretLine?.split("=").slice(1).join("=") ?? "").trim();
  if (weakSecrets.has(currentSecret.toLowerCase()) || currentSecret.length < 32) {
    const secret = randomBytes(32).toString("hex");
    if (secretLine) {
      lines = lines.map((line) => (line.startsWith("SESSION_SECRET=") ? `SESSION_SECRET=${secret}` : line));
    } else {
      lines.push(`SESSION_SECRET=${secret}`);
    }
    console.log("[zentry] Generated a new strong session secret.");
  }
  writeFileSync(envPath, `${lines.filter(Boolean).join("\n")}\n`, "utf8");
  console.log(`[zentry] Owner login written to ${envPath} (bcrypt hash only).`);
  console.log("[zentry] Keep .env private — it is gitignored.");
}

void main();
