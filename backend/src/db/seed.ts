import type Database from "better-sqlite3";
import { renderPage } from "../generator/renderPage";
import { writeGeneratedPage } from "../lib/generated";
import { logActivity } from "../lib/activity";

/** One clearly fictional demo lead/client/page so the admin is useful on first run. */
export function seedDemo(db: Database.Database): void {
  const existing = db.prepare("SELECT COUNT(*) AS n FROM leads").get() as { n: number };
  if (existing.n > 0) return;

  const stamp = "2026-11-20T08:00:00.000Z";
  const config = {
    businessName: "Riverside Dental Practice (DEMO)",
    phone: "+254 701 074 998",
    address: "18 Mill Lane, Riverside, RV1 2AB",
    serviceBlurb: "Family dentistry in Riverside — open and taking appointments.",
    accentColor: "#00D6B4",
  };
  const slug = "riverside-dental-demo";
  const html = renderPage(config, 1, slug);

  db.transaction(() => {
    db.prepare(
      `INSERT INTO leads (id, name, email, phone, business, need, source, status, created_at)
       VALUES (1, 'Demo Client', 'demo@example.com', '+254 701 074 998', 'Riverside Dental Practice',
               'One-page holding site', 'website', 'paid', ?)`,
    ).run(stamp);

    db.prepare(
      `INSERT INTO clients (id, lead_id, business_name, phone, address, service, amount, currency,
                            payment_status, payment_ref, created_at)
       VALUES (1, 1, ?, ?, ?, ?, 79, 'USD', 'paid', 'SAMPLE-DEMO', ?)`,
    ).run(config.businessName, config.phone, config.address, config.serviceBlurb, stamp);

    db.prepare(
      `INSERT INTO pages (id, client_id, slug, config_json, status, deployed_url, html, created_at)
       VALUES (1, 1, ?, ?, 'generated', '', ?, ?)`,
    ).run(slug, JSON.stringify(config), html, stamp);

    db.prepare(
      `INSERT INTO enquiries (id, page_id, name, phone, message, source, created_at, notified)
       VALUES (1, 1, 'Demo Visitor', '+254 700 000 001', 'Sample enquiry — no action required.',
               'page:${slug}', ?, 0)`,
    ).run(stamp);

    db.prepare(
      `INSERT INTO invoices (id, client_id, number, amount, currency, status, issued_at, paid_at)
       VALUES (1, 1, 'ZNT-2026-0001', 79, 'USD', 'paid', ?, ?)`,
    ).run(stamp, stamp);

    logActivity(db, "seed", "demo", "Demo lead, client, page and invoice created", stamp);
  })();

  writeGeneratedPage(slug, html);
}
