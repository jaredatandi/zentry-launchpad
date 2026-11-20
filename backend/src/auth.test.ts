import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type Database from "better-sqlite3";
import type { AddressInfo } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Server } from "node:http";
import { createApp } from "./app";
import { hashPassword, revokeSession, signSession, verifyPassword, verifySession } from "./auth";
import { openDatabase } from "./db";

const SECRET = "test-secret-only-not-used-in-production";
const EMAIL = "owner@example.com";
const PASSWORD = "a-very-long-test-password";

let db: Database.Database;
let server: Server;
let base: string;
let dir: string;
let cookie = "";

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "zentry-auth-"));
  process.env.GENERATED_DIR = dir;
  db = openDatabase(join(dir, "test.db"));
  const hash = await hashPassword(PASSWORD);
  expect(await verifyPassword(PASSWORD, hash)).toBe(true);
  expect(await verifyPassword("wrong", hash)).toBe(false);

  const app = createApp(db, {
    sessionSecret: SECRET,
    adminEmail: EMAIL,
    adminPasswordHash: hash,
    cookieSecure: false,
  });
  server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  base = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  db.close();
  delete process.env.GENERATED_DIR;
  rmSync(dir, { recursive: true, force: true });
});

describe("owner authentication", () => {
  it("signs and verifies session tokens", async () => {
    const token = await signSession(EMAIL, SECRET);
    expect(await verifySession(token, SECRET)).toBe(EMAIL);
    expect(await verifySession(`${token}tampered`, SECRET)).toBeNull();
  });

  it("rejects unauthenticated admin requests", async () => {
    const res = await fetch(`${base}/api/admin/dashboard`);
    expect(res.status).toBe(401);
  });

  it("rejects a wrong password", async () => {
    const res = await fetch(`${base}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: "not-the-password" }),
    });
    expect(res.status).toBe(401);
  });

  it("sets an HTTP-only cookie on success and guards admin routes with it", async () => {
    const res = await fetch(`${base}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie.toLowerCase()).toContain("httponly");
    cookie = setCookie.split(";")[0]!;

    const dashboard = await fetch(`${base}/api/admin/dashboard`, {
      headers: { Cookie: cookie },
    });
    expect(dashboard.status).toBe(200);
    const body = (await dashboard.json()) as { counts: { leads: number } };
    expect(body.counts.leads).toBeGreaterThan(0);
  });

  it("logs out", async () => {
    const res = await fetch(`${base}/api/admin/logout`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const after = await fetch(`${base}/api/admin/dashboard`, {
      headers: { Cookie: cookie },
    });
    expect(after.status).toBe(401); // the token is revoked server-side on sign-out
    expect(res.headers.get("set-cookie")).toContain("Expires");
  });

  it("does not crash on a malformed Cookie header", async () => {
    const res = await fetch(`${base}/api/admin/dashboard`, {
      headers: { Cookie: "zentry_admin=%" },
    });
    expect(res.status).toBe(401);
  });

  it("rejects a revoked token directly", async () => {
    const token = await signSession(EMAIL, SECRET);
    expect(await verifySession(token, SECRET)).toBe(EMAIL);
    revokeSession(token);
    expect(await verifySession(token, SECRET)).toBeNull();
  });
});
