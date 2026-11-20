import express, { type NextFunction, type Request, type Response } from "express";
import type Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { config as defaultConfig, SESSION_COOKIE, type AppConfig } from "./config";
import {
  parseCookies,
  requireAuth,
  revokeSession,
  sessionCookieOptions,
  signSession,
  verifyPassword,
} from "./auth";
import { logActivity } from "./lib/activity";
import { clientIp } from "./lib/clientIp";
import { RateLimiter } from "./lib/rateLimit";
import { formatIssues, loginSchema } from "./validation";
import { publicRouter } from "./routes/public";
import { adminRouter } from "./routes/admin";
import { generatedDirectory } from "./lib/generated";

export interface AppOptions {
  sessionSecret: string;
  adminEmail: string;
  adminPasswordHash: string;
  cookieSecure: boolean;
  frontendDist?: string;
}

export function createApp(db: Database.Database, options: AppOptions): express.Express {
  const app = express();
  const frontendDist = options.frontendDist ?? defaultConfig.frontendDist;

  // Only honour X-Forwarded-For when a known proxy is configured. Otherwise
  // req.ip is the socket address and cannot be forged by the client.
  const trustProxy = Number.parseInt(process.env.TRUST_PROXY ?? "", 10);
  if (Number.isFinite(trustProxy) && trustProxy >= 0) app.set("trust proxy", trustProxy);

  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.set("X-Frame-Options", "SAMEORIGIN");
    res.set("X-Permitted-Cross-Domain-Policies", "none");
    res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
    // Generated pages and the SPA use first-party inline style/script blocks.
    // Everything else must come from this origin; no third-party assets are used.
    res.set(
      "Content-Security-Policy",
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; " +
        "form-action 'self'; connect-src 'self'; img-src 'self' data:; font-src 'self' data:; " +
        "script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    );
    if (options.cookieSecure) {
      res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });
  app.use(express.json({ limit: "128kb" }));
  app.use(express.urlencoded({ extended: false, limit: "128kb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", publicRouter(db));

  const loginLimiter = new RateLimiter(5, 15 * 60 * 1000);

  app.post("/api/admin/login", async (req, res) => {
    const attemptedEmail = typeof req.body?.email === "string" ? req.body.email.toLowerCase() : "";
    const limit = loginLimiter.check(`${clientIp(req)}:${attemptedEmail}`);
    if (!limit.allowed) {
      res.set("Retry-After", String(limit.retryAfter));
      res.status(429).json({ error: "Too many sign-in attempts. Try again shortly." });
      return;
    }

    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Check your login details", issues: formatIssues(parsed.error) });
      return;
    }
    if (!options.adminPasswordHash) {
      res.status(503).json({ error: "Owner login is not configured. Run: npm run setup:admin" });
      return;
    }
    const emailMatches = parsed.data.email.toLowerCase() === options.adminEmail.toLowerCase();
    const passwordMatches = await verifyPassword(parsed.data.password, options.adminPasswordHash);
    if (!emailMatches || !passwordMatches) {
      logActivity(db, "login_failed", "admin", "Failed owner sign-in attempt");
      res.status(401).json({ error: "Incorrect email or password" });
      return;
    }
    const token = await signSession(options.adminEmail, options.sessionSecret);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions(options.cookieSecure));
    logActivity(db, "login", "admin", "Owner signed in");
    res.json({ ok: true, email: options.adminEmail });
  });

  app.post("/api/admin/logout", (req, res) => {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    if (token) revokeSession(token);
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.json({ ok: true });
  });

  app.use(
    "/api/admin",
    requireAuth(options.sessionSecret, options.adminEmail),
    adminRouter(db),
  );

  // Public generated pages, served from the stored HTML (also exported to generated/).
  app.get("/p/:slug", (req, res) => {
    const row = db.prepare("SELECT html FROM pages WHERE slug = ?").get(req.params.slug) as
      | { html: string }
      | undefined;
    if (!row) {
      res.status(404).type("html").send("<!doctype html><title>Page not found</title><h1>Page not found</h1>");
      return;
    }
    res.set("Cache-Control", "no-store").type("html").send(row.html);
  });

  app.use("/generated", express.static(generatedDirectory(), { fallthrough: true }));

  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

  if (existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/p/")) return next();
      res.sendFile(join(frontendDist, "index.html"));
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[zentry]", err);
    res.status(400).json({ error: "Invalid request" });
  });

  return app;
}
