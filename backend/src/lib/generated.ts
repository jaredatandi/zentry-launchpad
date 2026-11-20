import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { slugify } from "./slug";

const defaultGeneratedDir = join(__dirname, "..", "..", "..", "generated");

/** Override with GENERATED_DIR in tests so they never write into the repo. */
export function generatedDirectory(): string {
  return process.env.GENERATED_DIR ? resolve(process.env.GENERATED_DIR) : defaultGeneratedDir;
}

export function writeGeneratedPage(slug: string, html: string): string {
  const dir = generatedDirectory();
  const safeName = slugify(slug);
  const path = join(dir, `${safeName}.html`);
  // On Vercel the filesystem is read-only; the HTML is already in the database.
  if (process.env.VERCEL) return path;
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, html, "utf8");
  return path;
}
