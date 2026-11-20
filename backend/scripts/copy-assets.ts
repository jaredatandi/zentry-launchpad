import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Keep non-TypeScript assets next to the compiled JS in dist/.
const root = join(__dirname, "..");
const dist = join(root, "dist");
mkdirSync(dist, { recursive: true });

mkdirSync(join(dist, "migrations"), { recursive: true });
for (const file of ["001_initial.sql"]) {
  copyFileSync(join(root, "migrations", file), join(dist, "migrations", file));
}
