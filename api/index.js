/* Vercel serverless entrypoint.
 * The whole Express app is reused; only the database is remote (Neon Postgres).
 * Secrets are injected as Vercel environment variables, never committed.
 */
const { createApp } = require("../backend/dist/app");
const { openPostgresDatabase } = require("../backend/dist/db/postgres");

let appPromise;

async function buildApp() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be configured on Vercel");
  }
  const db = openPostgresDatabase(databaseUrl);
  await db.ready;
  return createApp(db, {
    sessionSecret: process.env.SESSION_SECRET || "",
    adminEmail: (process.env.ADMIN_EMAIL || "").toLowerCase(),
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
    cookieSecure: process.env.COOKIE_SECURE === "true",
  });
}

module.exports = async function handler(req, res) {
  // Vercel terminates TLS; Express must trust one proxy hop for clientIp().
  req.headers["x-forwarded-for"] =
    req.headers["x-forwarded-for"] || req.headers["cf-connecting-ip"];

  if (!appPromise) appPromise = buildApp();

  try {
    const app = await appPromise;
    await new Promise((resolve, reject) => {
      const cleanup = () => {
        res.off("finish", onFinish);
        res.off("close", onFinish);
        res.off("error", onError);
      };
      const onFinish = () => {
        cleanup();
        resolve();
      };
      const onError = (error) => {
        cleanup();
        reject(error);
      };
      res.on("finish", onFinish);
      res.on("close", onFinish);
      res.on("error", onError);
      app(req, res);
    });
  } catch (error) {
    console.error("[zentry] deployment error", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Server is starting. Please retry in a moment." }));
    }
  }
};
