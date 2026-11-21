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

  const app = createApp(db, {
    sessionSecret: process.env.SESSION_SECRET || "",
    adminEmail: (process.env.ADMIN_EMAIL || "").toLowerCase(),
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
    cookieSecure: process.env.COOKIE_SECURE === "true",
  });
  return serverless(app, {
    request(request) {
      // Vercel terminates TLS; Express must trust one proxy hop for clientIp().
      request.headers["x-forwarded-for"] =
        request.headers["x-forwarded-for"] || request.headers["cf-connecting-ip"];
      return request;
    },
  });
}

module.exports = async function handler(req, res) {
  if (!handlerPromise) handlerPromise = buildHandler();
  try {
    const handler = await handlerPromise;
    return await handler(req, res);
  } catch (error) {
    console.error("[zentry] deployment error", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Server is starting. Please retry in a moment." }));
    }
  }
};
