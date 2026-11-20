import type Database from "better-sqlite3";
import type { AsyncDatabase } from "./types";
import { renderPage } from "../generator/renderPage";
import { writeGeneratedPage } from "../lib/generated";
import { ACTIVITY_INSERT, logActivity } from "../lib/activity";

const COUNT_LEADS = "SELECT COUNT(*) AS n FROM leads";

interface SeedStatement {
  sql: string;
  params: unknown[];
}

interface SeedPlan {
  statements: SeedStatement[];
  message: string;
  stamp: string;
  slug: string;
  html: string;
}

/** One clearly fictional demo lead/client/page and invoice so the admin is useful on first run. */
function buildSeed(): SeedPlan {
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

  return {
    stamp,
    slug,
    html,
    message: "Demo lead, client, page and invoice created",
    statements: [
      {
        sql: `INSERT INTO leads (id, name, email, phone, business, need, source, status, created_at)
       VALUES (1, 'Demo Client', 'demo@example.com', '+254 701 074 998', 'Riverside Dental Practice',
               'One-page holding site', 'website', 'paid', ?)`,
        params: [stamp],
      },
      {
        sql: `INSERT INTO clients (id, lead_id, business_name, phone, address, service, amount, currency,
                             payment_status, payment_ref, created_at)
        VALUES (1, 1, ?, ?, ?, ?, 79, 'USD', 'paid', 'SAMPLE-DEMO', ?)`,
        params: [config.businessName, config.phone, config.address, config.serviceBlurb, stamp],
      },
      {
        sql: `INSERT INTO pages (id, client_id, slug, config_json, status, deployed_url, html, created_at)
        VALUES (1, 1, ?, ?, 'generated', '', ?, ?)`,
        params: [slug, JSON.stringify(config), html, stamp],
      },
      {
        sql: `INSERT INTO enquiries (id, page_id, name, phone, message, source, created_at, notified)
        VALUES (1, 1, 'Demo Visitor', '+254 700 000 001', 'Sample enquiry — no action required.',
                'page:${slug}', ?, 0)`,
        params: [stamp],
      },
      {
        sql: `INSERT INTO invoices (id, client_id, number, amount, currency, status, issued_at, paid_at)
        VALUES (1, 1, 'ZNT-2026-0001', 79, 'USD', 'paid', ?, ?)`,
        params: [stamp, stamp],
      },
    ],
  };
}

/** Local better-sqlite3 path: seeding stays synchronous so openDatabase() can
 * return a fully initialised database (its `ready` is already resolved). */
export function seedDemoSync(db: Database.Database): void {
  const existing = db.prepare(COUNT_LEADS).get() as { n: number };
  if (existing.n > 0) return;

  const plan = buildSeed();
  db.transaction(() => {
    for (const statement of plan.statements) {
      db.prepare(statement.sql).run(...statement.params);
    }
    db.prepare(ACTIVITY_INSERT).run("seed", "demo", plan.message, plan.stamp);
  })();

  writeGeneratedPage(plan.slug, plan.html);
}

/** Async path used by the libSQL/Turso adapter during initialisation. */
export async function seedDemo(db: AsyncDatabase): Promise<void> {
  const existing = (await db.prepare(COUNT_LEADS).get()) as { n: number } | undefined;
  if (existing && existing.n > 0) return;

  const plan = buildSeed();
  for (const statement of plan.statements) {
    await db.prepare(statement.sql).run(...statement.params);
  }
  await logActivity(db, "seed", "demo", plan.message, plan.stamp);

  writeGeneratedPage(plan.slug, plan.html);
}
