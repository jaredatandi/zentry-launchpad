import type Database from "better-sqlite3";
import { nowIso } from "./time";

export function logActivity(
  db: Database.Database,
  type: string,
  entity: string,
  message: string,
  createdAt?: string,
): void {
  db.prepare(
    "INSERT INTO activity (type, entity, message, created_at) VALUES (?, ?, ?, ?)",
  ).run(type, entity, message, createdAt ?? nowIso());
}
