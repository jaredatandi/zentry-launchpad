/* Vercel serverless entrypoint.
 * The whole Express app is reused; only the database is remote (Turso/libSQL).
 * Secrets are injected as Vercel environment variables, never committed.
 */
const serverless = require("serverless-http");
const { createApp } = require("../backend/dist/app");
const { openRemoteDatabase } = require("../backend/dist/db");

let handlerPromise;

async function buildHandler() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured on Vercel");
  }
  const db = openRemoteDatabase(url, token);
  await db.ready;

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
