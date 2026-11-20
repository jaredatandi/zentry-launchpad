import type { AsyncDatabase } from "../db/types";
import { nowIso } from "./time";

export const ACTIVITY_INSERT =
  "INSERT INTO activity (type, entity, message, created_at) VALUES (?, ?, ?, ?)";

export async function logActivity(
  db: AsyncDatabase,
  type: string,
  entity: string,
  message: string,
  createdAt?: string,
): Promise<void> {
  await db.prepare(ACTIVITY_INSERT).run(type, entity, message, createdAt ?? nowIso());
}
