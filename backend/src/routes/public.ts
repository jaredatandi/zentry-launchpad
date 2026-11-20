import { Router } from "express";
import type Database from "better-sqlite3";
import { logActivity } from "../lib/activity";
import { nowIso } from "../lib/time";
import { clientIp } from "../lib/clientIp";
import { RateLimiter } from "../lib/rateLimit";
import { enquirySchema, formatIssues, leadSchema } from "../validation";

export function publicRouter(db: Database.Database): Router {
  const router = Router();
  const leadLimiter = new RateLimiter(5, 10 * 60 * 1000);
  const enquiryLimiter = new RateLimiter(6, 10 * 60 * 1000);

  router.post("/leads", (req, res) => {
    const limit = leadLimiter.check(clientIp(req));
    if (!limit.allowed) {
      res.set("Retry-After", String(limit.retryAfter));
      res.status(429).json({ error: "Too many submissions. Please try again shortly." });
      return;
    }

    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please check the form", issues: formatIssues(parsed.error) });
      return;
    }
    const input = parsed.data;
    if (input.website) {
      res.status(200).json({ ok: true }); // honeypot: accept silently
      return;
    }
    if (input.elapsed > 0 && input.elapsed < 1200) {
      res.status(400).json({ error: "Please take a moment to complete the form." });
      return;
    }

    const result = db
      .prepare(
        `INSERT INTO leads (name, email, phone, business, need, source, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'new', ?)`,
      )
      .run(
        input.name,
        input.email,
        input.phone,
        input.business,
        input.need,
        input.source,
        nowIso(),
      );
    logActivity(
      db,
      "lead_created",
      `lead:${result.lastInsertRowid}`,
      `New lead received (${input.source})`,
    );
    res.status(201).json({ ok: true, id: Number(result.lastInsertRowid) });
  });

  router.post("/enquiries", (req, res) => {
    const limit = enquiryLimiter.check(clientIp(req));
    if (!limit.allowed) {
      res.set("Retry-After", String(limit.retryAfter));
      res.status(429).json({ error: "Too many enquiries. Please call us instead." });
      return;
    }

    const parsed = enquirySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please check the form", issues: formatIssues(parsed.error) });
      return;
    }
    const input = parsed.data;
    if (input.website) {
      res.status(200).json({ ok: true });
      return;
    }
    if (input.elapsed > 0 && input.elapsed < 1200) {
      res.status(400).json({ error: "Please take a moment to complete the form." });
      return;
    }

    const page = db
      .prepare("SELECT id, slug, status FROM pages WHERE id = ?")
      .get(input.pageId) as { id: number; slug: string; status: string } | undefined;
    if (!page || page.status === "archived") {
      res.status(404).json({ error: "This page is no longer accepting enquiries." });
      return;
    }

    const source = `page:${page.slug}${input.source ? ` · ${input.source}` : ""}`.slice(0, 120);
    const result = db
      .prepare(
        `INSERT INTO enquiries (page_id, name, phone, message, source, created_at, notified)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
      )
      .run(page.id, input.name, input.phone, input.message, source, nowIso());
    logActivity(
      db,
      "enquiry_created",
      `page:${page.slug}`,
      `Enquiry received on /p/${page.slug}`,
    );
    res.status(201).json({ ok: true, id: Number(result.lastInsertRowid) });
  });

  return router;
}
