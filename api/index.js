/* Vercel serverless entrypoint.
 * The whole Express app is reused; only the database is remote (Neon Postgres).
 * Secrets are injected as Vercel environment variables, never committed.
 */
const serverless = require("serverless-http");
const { createApp } = require("../backend/dist/app");
const { openPostgresDatabase } = require("../backend/dist/db/postgres");

let handlerPromise;

async function buildHandler() {
  const databaseUrl = process.env.DATABASE_URL;
  console.log("[zentry] env check", {
    hasDatabaseUrl: Boolean(databaseUrl),
    hasSessionSecret: Boolean(process.env.SESSION_SECRET),
    hasAdminEmail: Boolean(process.env.ADMIN_EMAIL),
    hasAdminPasswordHash: Boolean(process.env.ADMIN_PASSWORD_HASH),
    cookieSecure: process.env.COOKIE_SECURE === "true",
    trustProxy: process.env.TRUST_PROXY,
  });
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be configured on Vercel");
  }
  console.log("[zentry] opening database");
  const db = openPostgresDatabase(databaseUrl);
  await db.ready;
  console.log("[zentry] database ready");

  console.log("[zentry] building app");
  const app = createApp(db, {
    sessionSecret: process.env.SESSION_SECRET || "",
    adminEmail: (process.env.ADMIN_EMAIL || "").toLowerCase(),
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
    cookieSecure: process.env.COOKIE_SECURE === "true",
  });
  console.log("[zentry] app built, wrapping serverless");
  const wrapped = serverless(app, {
    request(request) {
      // Vercel terminates TLS; Express must trust one proxy hop for clientIp().
      request.headers["x-forwarded-for"] =
        request.headers["x-forwarded-for"] || request.headers["cf-connecting-ip"];
      return request;
    },
  });
  console.log("[zentry] serverless wrapper ready");
  return wrapped;
}

module.exports = async function handler(req, res) {
  console.log("[zentry] request", req.method, req.url);
  if (req.url && req.url.split("?")[0] === "/api/ping") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, ping: true }));
    return;
  }
  if (req.url && req.url.split("?")[0] === "/api/probe") {
    const express = require("express");
    const probe = express();
    probe.get("/api/probe", (_req, res) => res.json({ ok: true, probe: true }));
    return serverless(probe)(req, res);
  }
  if (req.url && req.url.split("?")[0] === "/api/direct") {
    const express = require("express");
    const probe = express();
    probe.get("/api/direct", (_req, res) => res.json({ ok: true, direct: true }));
    return new Promise((resolve) => {
      res.on("finish", resolve);
      res.on("close", resolve);
      probe(req, res);
    });
  }
  if (!handlerPromise) handlerPromise = buildHandler();
  try {
    const handler = await handlerPromise;
    console.log("[zentry] invoking app");
    const result = await handler(req, res);
    console.log("[zentry] app returned");
    return result;
  } catch (error) {
    console.error("[zentry] deployment error", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Server is starting. Please retry in a moment." }));
    }
  }
};
