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
  mkdirSync(dir, { recursive: true });
  const safeName = slugify(slug);
  const path = join(dir, `${safeName}.html`);
  writeFileSync(path, html, "utf8");
  return path;
}
