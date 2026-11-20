import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { seedDemo } from "./seed";

function migrationPath(): string {
  const candidates = [
    join(__dirname, "..", "..", "migrations", "001_initial.sql"),
    join(__dirname, "migrations", "001_initial.sql"),
  ];
  const found = candidates.find(existsSync);
  if (!found) throw new Error("Migration file 001_initial.sql not found");
  return found;
}

export function openDatabase(filePath: string, withSeed = true): Database.Database {
  mkdirSync(dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(readFileSync(migrationPath(), "utf8"));
  if (withSeed) seedDemo(db);
  return db;
}
