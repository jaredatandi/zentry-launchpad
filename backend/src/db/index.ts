import Database from "better-sqlite3";
import { createClient, type InValue, type ResultSet } from "@libsql/client";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { seedDemo, seedDemoSync } from "./seed";
import type { AsyncDatabase } from "./types";

function migrationPath(): string {
  const candidates = [
    join(__dirname, "..", "..", "migrations", "001_initial.sql"),
    join(__dirname, "migrations", "001_initial.sql"),
  ];
  const found = candidates.find(existsSync);
  if (!found) throw new Error("Migration file 001_initial.sql not found");
  return found;
}

function migrationSql(): string {
  return readFileSync(migrationPath(), "utf8");
}

function localDatabase(db: Database.Database): AsyncDatabase {
  return {
    ready: Promise.resolve(),
    prepare(sql) {
      const statement = db.prepare(sql);
      return {
        get: (...params) => Promise.resolve(statement.get(...params) as any),
        all: (...params) => Promise.resolve(statement.all(...params) as any[]),
        run: (...params) => {
          const info = statement.run(...params);
          return Promise.resolve({
            lastInsertRowid: info.lastInsertRowid,
            changes: info.changes,
          });
        },
      };
    },
    exec: (sql) => {
      db.exec(sql);
      return Promise.resolve();
    },
    close: () => {
      db.close();
    },
  };
}

export function openDatabase(filePath: string, withSeed = true): AsyncDatabase {
  mkdirSync(dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(migrationSql());
  if (withSeed) seedDemoSync(db);
  return localDatabase(db);
}

/** libSQL rows are Row objects; copying them with a spread turns them into
 * plain objects with the same named columns as better-sqlite3 rows. */
function plainRows(result: ResultSet): any[] {
  return result.rows.map((row) => ({ ...row })) as any[];
}

export function openRemoteDatabase(url: string, authToken: string, withSeed = true): AsyncDatabase {
  const client = createClient({ url, authToken, intMode: "number" });

  const adapter: AsyncDatabase = {
    ready: Promise.resolve(),
    prepare(sql) {
      return {
        async get(...params) {
          const result = await client.execute({ sql, args: params as InValue[] });
          return plainRows(result)[0];
        },
        async all(...params) {
          const result = await client.execute({ sql, args: params as InValue[] });
          return plainRows(result);
        },
        async run(...params) {
          const result = await client.execute({ sql, args: params as InValue[] });
          return {
            lastInsertRowid: result.lastInsertRowid ?? 0,
            changes: result.rowsAffected,
          };
        },
      };
    },
    // The migration script contains multiple statements; executeMultiple keeps
    // them in order without requiring one round trip per statement.
    exec: (sql) => client.executeMultiple(sql),
    close: () => client.close(),
  };

  adapter.ready = (async () => {
    await adapter.exec(migrationSql());
    if (withSeed) await seedDemo(adapter);
  })();

  return adapter;
}
