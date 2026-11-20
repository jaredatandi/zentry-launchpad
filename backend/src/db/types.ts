/** Minimal database surface shared by the local (better-sqlite3) and remote
 * (libSQL/Turso) backends. Rows intentionally stay `any` so call sites do not
 * need a second set of database types. */
export interface AsyncStatement {
  get(...params: unknown[]): Promise<any>;
  all(...params: unknown[]): Promise<any[]>;
  run(...params: unknown[]): Promise<{ lastInsertRowid: number | bigint; changes: number }>;
}

export interface AsyncDatabase {
  prepare(sql: string): AsyncStatement;
  exec(sql: string): Promise<void>;
  /** Resolves once migrations and (when requested) seeding have finished. */
  ready: Promise<void>;
  close(): Promise<void> | void;
}
