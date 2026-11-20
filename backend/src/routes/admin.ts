import { Router } from "express";
import type Database from "better-sqlite3";
import type { AuthedRequest } from "../types";
import { logActivity } from "../lib/activity";
import { nowIso } from "../lib/time";
import { uniqueSlug } from "../lib/slug";
import { renderPage, type PageRenderConfig } from "../generator/renderPage";
import { renderInvoice } from "../generator/renderInvoice";
import { writeGeneratedPage } from "../lib/generated";
import { priceFor, type Currency } from "../lib/pricing";
import {
  clientSchema,
  formatIssues,
  invoiceCreateSchema,
  leadStatusSchema,
  pageConfigSchema,
  pageStatusSchema,
  paginationSchema,
} from "../validation";

function asId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function one<T>(db: Database.Database, sql: string, ...params: unknown[]): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

function all<T>(db: Database.Database, sql: string, ...params: unknown[]): T[] {
  return db.prepare(sql).all(...params) as T[];
}

interface EnquiryRow {
  id: number;
  page_id: number;
  slug: string;
  name: string;
  phone: string;
  message: string;
  source: string;
  created_at: string;
  notified: number;
}

interface ClientRow {
  id: number;
  lead_id: number | null;
  business_name: string;
  phone: string;
  address: string;
  service: string;
  amount: number;
  currency: Currency;
  payment_status: string;
  payment_ref: string;
  created_at: string;
}

interface PageRow {
  id: number;
  client_id: number;
  slug: string;
  config_json: string;
  status: string;
  deployed_url: string;
  html: string;
  created_at: string;
}

interface InvoiceRow {
  id: number;
  client_id: number;
  number: string;
  amount: number;
  currency: Currency;
  status: string;
  issued_at: string;
  paid_at: string | null;
}

const ENQUIRY_SELECT = `SELECT e.*, p.slug FROM enquiries e
  LEFT JOIN pages p ON p.id = e.page_id`;

export function adminRouter(db: Database.Database): Router {
  const router = Router();

  router.get("/dashboard", (_req, res) => {
    const count = (sql: string): number =>
      (one<{ n: number }>(db, sql)!).n;

    const byStatus = all<{ status: string; n: number }>(
      db,
      "SELECT status, COUNT(*) AS n FROM leads GROUP BY status",
    );
    const leadsByStatus: Record<string, number> = {};
    for (const row of byStatus) leadsByStatus[row.status] = row.n;

    const sourceStats = all<{ source: string; total: number; converted: number }>(
      db,
      `SELECT source, COUNT(*) AS total,
              SUM(CASE WHEN status IN ('qualified','quoted','paid','in_production','delivered') THEN 1 ELSE 0 END) AS converted
       FROM leads GROUP BY source ORDER BY total DESC`,
    ).map((row) => ({
      ...row,
      conversionRate: row.total ? Math.round((row.converted / row.total) * 100) : 0,
    }));

    res.json({
      counts: {
        leads: count("SELECT COUNT(*) AS n FROM leads"),
        newLeads: count("SELECT COUNT(*) AS n FROM leads WHERE status = 'new'"),
        clients: count("SELECT COUNT(*) AS n FROM clients"),
        pages: count("SELECT COUNT(*) AS n FROM pages"),
        enquiries: count("SELECT COUNT(*) AS n FROM enquiries"),
        unreadEnquiries: count("SELECT COUNT(*) AS n FROM enquiries WHERE notified = 0"),
        invoices: count("SELECT COUNT(*) AS n FROM invoices"),
        paidInvoices: count("SELECT COUNT(*) AS n FROM invoices WHERE status = 'paid'"),
      },
      leadsByStatus,
      sourceStats,
      recentLeads: all(db, "SELECT * FROM leads ORDER BY created_at DESC LIMIT 6"),
      recentEnquiries: all<EnquiryRow>(
        db,
        `${ENQUIRY_SELECT} ORDER BY e.created_at DESC LIMIT 6`,
      ),
    });
  });

  router.get("/leads", (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const page = paginationSchema.parse(req.query);
    const rows = status
      ? all(
          db,
          "SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
          status,
          page.limit,
          page.offset,
        )
      : all(db, "SELECT * FROM leads ORDER BY created_at DESC LIMIT ? OFFSET ?", page.limit, page.offset);
    res.json(rows);
  });

  router.get("/leads/:id", (req, res) => {
    const id = asId(req.params.id);
    const lead = id && one(db, "SELECT * FROM leads WHERE id = ?", id);
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    res.json(lead);
  });

  router.patch("/leads/:id", (req, res) => {
    const id = asId(req.params.id);
    const parsed = leadStatusSchema.safeParse(req.body);
    if (!parsed.success || !id) {
      res.status(400).json({ error: "Invalid status", issues: parsed.success ? [] : formatIssues(parsed.error) });
      return;
    }
    const existing = one(db, "SELECT id FROM leads WHERE id = ?", id);
    if (!existing) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(parsed.data.status, id);
    logActivity(db, "lead_status", `lead:${id}`, `Lead moved to ${parsed.data.status}`);
    res.json({ ok: true, status: parsed.data.status });
  });

  router.get("/clients", (_req, res) => {
    res.json(all(db, "SELECT * FROM clients ORDER BY created_at DESC"));
  });

  router.get("/clients/:id", (req, res) => {
    const id = asId(req.params.id);
    const client = id && one<ClientRow>(db, "SELECT * FROM clients WHERE id = ?", id);
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json({
      ...client,
      pages: all<PageRow>(db, "SELECT * FROM pages WHERE client_id = ? ORDER BY created_at DESC", id),
      invoices: all<InvoiceRow>(
        db,
        "SELECT * FROM invoices WHERE client_id = ? ORDER BY issued_at DESC",
        id,
      ),
    });
  });

  router.post("/clients", (req, res) => {
    const parsed = clientSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please check the details", issues: formatIssues(parsed.error) });
      return;
    }
    const c = parsed.data;
    if (c.leadId && !one(db, "SELECT id FROM leads WHERE id = ?", c.leadId)) {
      res.status(404).json({ error: "Linked lead not found" });
      return;
    }
    const amount = c.amount || priceFor(c.currency);
    const result = db
      .prepare(
        `INSERT INTO clients (lead_id, business_name, phone, address, service, amount, currency,
                              payment_status, payment_ref, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        c.leadId || null,
        c.businessName,
        c.phone,
        c.address,
        c.service,
        amount,
        c.currency,
        c.paymentStatus,
        c.paymentRef,
        nowIso(),
      );
    const id = Number(result.lastInsertRowid);
    logActivity(db, "client_created", `client:${id}`, `Client created for ${c.businessName}`);
    res.status(201).json({ ok: true, id });
  });

  router.patch("/clients/:id", (req, res) => {
    const id = asId(req.params.id);
    if (!id || !one(db, "SELECT id FROM clients WHERE id = ?", id)) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    const parsed = clientSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please check the details", issues: formatIssues(parsed.error) });
      return;
    }
    const c = parsed.data;
    db.prepare(
      `UPDATE clients SET business_name=?, phone=?, address=?, service=?, amount=?, currency=?,
                          payment_status=?, payment_ref=? WHERE id=?`,
    ).run(
      c.businessName,
      c.phone,
      c.address,
      c.service,
      c.amount || priceFor(c.currency),
      c.currency,
      c.paymentStatus,
      c.paymentRef,
      id,
    );
    logActivity(db, "client_updated", `client:${id}`, `Client ${id} updated`);
    res.json({ ok: true });
  });

  router.get("/pages", (_req, res) => {
    res.json(
      all<PageRow & { business_name: string }>(
        db,
        `SELECT p.*, c.business_name FROM pages p JOIN clients c ON c.id = p.client_id
         ORDER BY p.created_at DESC`,
      ).map(({ html: _html, config_json: _config, ...rest }) => rest),
    );
  });

  router.get("/pages/:id", (req, res) => {
    const id = asId(req.params.id);
    const page = id && one<PageRow>(db, "SELECT * FROM pages WHERE id = ?", id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.json({ ...page, config: JSON.parse(page.config_json) as PageRenderConfig });
  });

  router.post("/pages/generate", (req, res) => {
    const parsed = pageConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please check the page details", issues: formatIssues(parsed.error) });
      return;
    }
    const input = parsed.data;
    const client = one<ClientRow>(db, "SELECT * FROM clients WHERE id = ?", input.clientId);
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    const slug = input.slug
      ? input.slug
      : uniqueSlug(input.businessName, (candidate) => !!one(db, "SELECT id FROM pages WHERE slug = ?", candidate));
    if (one(db, "SELECT id FROM pages WHERE slug = ?", slug)) {
      res.status(409).json({ error: "That page address is already in use" });
      return;
    }

    const config: PageRenderConfig = {
      businessName: input.businessName,
      phone: input.phone,
      address: input.address,
      serviceBlurb: input.serviceBlurb,
      accentColor: input.accentColor.toUpperCase(),
    };
    const html = renderPage(config, 0, slug); // id is patched after insert below
    const result = db
      .prepare(
        `INSERT INTO pages (client_id, slug, config_json, status, deployed_url, html, created_at)
         VALUES (?, ?, ?, 'generated', '', ?, ?)`,
      )
      .run(input.clientId, slug, JSON.stringify(config), html, nowIso());
    const id = Number(result.lastInsertRowid);

    // Re-render with the real id so the embedded form targets this page exactly.
    const finalHtml = renderPage(config, id, slug);
    db.prepare("UPDATE pages SET html = ? WHERE id = ?").run(finalHtml, id);
    writeGeneratedPage(slug, finalHtml);
    logActivity(db, "page_generated", `page:${id}`, `Page /p/${slug} generated`);
    res.status(201).json({ ok: true, id, slug, url: `/p/${slug}` });
  });

  router.patch("/pages/:id", (req, res) => {
    const id = asId(req.params.id);
    const parsed = pageStatusSchema.safeParse(req.body);
    if (!id || !parsed.success) {
      res.status(400).json({ error: "Invalid page update" });
      return;
    }
    if (!one(db, "SELECT id FROM pages WHERE id = ?", id)) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    db.prepare("UPDATE pages SET status = ?, deployed_url = ? WHERE id = ?").run(
      parsed.data.status,
      parsed.data.deployedUrl,
      id,
    );
    logActivity(db, "page_updated", `page:${id}`, `Page marked ${parsed.data.status}`);
    res.json({ ok: true });
  });

  router.get("/pages/:id/html", (req, res) => {
    const id = asId(req.params.id);
    const page = id && one<PageRow>(db, "SELECT html FROM pages WHERE id = ?", id);
    if (!page) {
      res.status(404).type("text/plain").send("Page not found");
      return;
    }
    res.set("Cache-Control", "no-store").type("html").send(page.html);
  });

  router.get("/enquiries", (req, res) => {
    const page = paginationSchema.parse(req.query);
    res.json(
      all<EnquiryRow>(
        db,
        `${ENQUIRY_SELECT} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
        page.limit,
        page.offset,
      ),
    );
  });

  router.patch("/enquiries/:id", (req, res) => {
    const id = asId(req.params.id);
    const notified = req.body?.notified === true ? 1 : 0;
    if (!id || !one(db, "SELECT id FROM enquiries WHERE id = ?", id)) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }
    db.prepare("UPDATE enquiries SET notified = ? WHERE id = ?").run(notified, id);
    res.json({ ok: true, notified });
  });

  router.post("/invoices", (req, res) => {
    const parsed = invoiceCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Client is required" });
      return;
    }
    const client = one<ClientRow>(db, "SELECT * FROM clients WHERE id = ?", parsed.data.clientId);
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    const year = new Date().getUTCFullYear();
    const next = (one<{ n: number }>(db, "SELECT COALESCE(MAX(id), 0) + 1 AS n FROM invoices")!).n;
    const number = `ZNT-${year}-${String(next).padStart(4, "0")}`;
    const result = db
      .prepare(
        `INSERT INTO invoices (client_id, number, amount, currency, status, issued_at, paid_at)
         VALUES (?, ?, ?, ?, 'issued', ?, NULL)`,
      )
      .run(client.id, number, priceFor(client.currency), client.currency, nowIso());
    logActivity(db, "invoice_created", `invoice:${number}`, `Invoice ${number} issued to ${client.business_name}`);
    res.status(201).json({ ok: true, id: Number(result.lastInsertRowid), number });
  });

  router.get("/invoices", (_req, res) => {
    res.json(
      all<InvoiceRow & { business_name: string }>(
        db,
        `SELECT i.*, c.business_name FROM invoices i JOIN clients c ON c.id = i.client_id
         ORDER BY i.issued_at DESC`,
      ),
    );
  });

  router.get("/invoices/:id", (req, res) => {
    const id = asId(req.params.id);
    const row = id &&
      one<InvoiceRow & { business_name: string; address: string; phone: string }>(
        db,
        `SELECT i.*, c.business_name, c.address, c.phone FROM invoices i
         JOIN clients c ON c.id = i.client_id WHERE i.id = ?`,
        id,
      );
    if (!row) {
      res.status(404).type("text/plain").send("Invoice not found");
      return;
    }
    res
      .set("Cache-Control", "no-store")
      .type("html")
      .send(
        renderInvoice({
          number: row.number,
          issuedAt: row.issued_at,
          paidAt: row.paid_at,
          status: row.status,
          amount: row.amount,
          currency: row.currency,
          businessName: row.business_name,
          address: row.address,
          phone: row.phone,
        }),
      );
  });

  router.get("/activity", (req, res) => {
    const page = paginationSchema.parse(req.query);
    res.json(
      all(db, "SELECT * FROM activity ORDER BY created_at DESC LIMIT ? OFFSET ?", page.limit, page.offset),
    );
  });

  return router;
}
