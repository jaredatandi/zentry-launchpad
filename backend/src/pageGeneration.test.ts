import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type Database from "better-sqlite3";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "./app";
import { hashPassword } from "./auth";
import { openDatabase } from "./db";
import { renderPage } from "./generator/renderPage";
import { renderInvoice } from "./generator/renderInvoice";

let db: Database.Database;
let server: Server;
let base: string;
let dir: string;
let cookie = "";

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "zentry-pages-"));
  process.env.GENERATED_DIR = dir;
  db = openDatabase(join(dir, "test.db"));
  const hash = await hashPassword("test-password-for-pages");
  const app = createApp(db, {
    sessionSecret: "page-test-secret",
    adminEmail: "owner@example.com",
    adminPasswordHash: hash,
    cookieSecure: false,
  });
  server = app.listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const login = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner@example.com", password: "test-password-for-pages" }),
  });
  cookie = (login.headers.get("set-cookie") || "").split(";")[0]!;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  db.close();
  delete process.env.GENERATED_DIR;
  rmSync(dir, { recursive: true, force: true });
});

describe("page generation", () => {
  it("escapes injected client text in generated HTML", () => {
    const html = renderPage(
      {
        businessName: `<script>alert("x")</script> Clinic`,
        phone: "+254701074998",
        address: `12 "Main" St & <b>Lane</b>`,
        serviceBlurb: "Family <i>dentistry</i> & care",
        accentColor: "#00D6B4",
      },
      7,
      "test-clinic",
    );
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; Clinic");
    expect(html).toContain("12 &quot;Main&quot; St &amp; &lt;b&gt;Lane&lt;/b&gt;");
    expect(html).toContain("tel:+254701074998");
    expect(html).toContain('name="pageId" value="7"');
    expect(html).toContain('name="name"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('name="message"');
  });

  it("generates a page and serves it publicly at /p/:slug", async () => {
    const res = await fetch(`${base}/api/admin/pages/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        clientId: 1,
        businessName: "Sunrise Physiotherapy",
        phone: "+254 702 111 222",
        address: "7 Kenyatta Avenue, Nairobi",
        serviceBlurb: "Physiotherapy and rehabilitation appointments",
        accentColor: "#0AA9C2",
      }),
    });
    expect(res.status).toBe(201);
    const created = (await res.json()) as { id: number; slug: string };
    expect(created.slug).toBe("sunrise-physiotherapy");

    const publicPage = await fetch(`${base}/p/${created.slug}`);
    expect(publicPage.status).toBe(200);
    const html = await publicPage.text();
    expect(html).toContain("Sunrise Physiotherapy");
    expect(html).toContain(`name="pageId" value="${created.id}"`);

    const preview = await fetch(`${base}/api/admin/pages/${created.id}/html`, {
      headers: { Cookie: cookie },
    });
    expect(preview.status).toBe(200);
    expect(await preview.text()).toBe(html);
  });

  it("records enquiries with the page slug attached", async () => {
    const res = await fetch(`${base}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        pageId: "1",
        name: "Test Visitor",
        phone: "+254700000123",
        message: "I would like to book an appointment please",
        elapsed: "5000",
        source: "page:riverside-dental-demo",
      }).toString(),
    });
    expect(res.status).toBe(201);

    const inbox = await fetch(`${base}/api/admin/enquiries`, { headers: { Cookie: cookie } });
    const rows = (await inbox.json()) as Array<{ slug: string; source: string; name: string }>;
    expect(rows[0]?.slug).toBe("riverside-dental-demo");
    expect(rows[0]?.source).toContain("page:riverside-dental-demo");
    expect(rows[0]?.name).toBe("Test Visitor");
  });

  it("renders invoice rails without prohibited content", () => {
    const html = renderPage(
      {
        businessName: "Kenya Clinic",
        phone: "+254701074998",
        address: "Nairobi",
        serviceBlurb: "Clinic appointments and care",
        accentColor: "#00D6B4",
      },
      1,
      "kenya-clinic",
    );
    expect(html.toLowerCase()).not.toContain("paypal");
    expect(html.toLowerCase()).not.toContain("serving worldwide");
  });

  it("prints correct prices and payment rails on both invoices", () => {
    const base = {
      number: "ZNT-2026-0002",
      issuedAt: "2026-11-20T08:00:00.000Z",
      paidAt: null,
      status: "issued",
      businessName: "Test Clinic",
      address: "Nairobi",
      phone: "+254701074998",
    };
    const usd = renderInvoice({ ...base, amount: 79, currency: "USD" }).toLowerCase();
    const kes = renderInvoice({ ...base, amount: 2500, currency: "KES" }).toLowerCase();

    expect(usd).toContain("us$79");
    expect(usd).toContain("bank details are sent on confirmation");
    expect(usd).toContain("two (2) revision rounds");
    expect(usd).toContain("48 hours");
    expect(usd).not.toContain("paypal");
    expect(usd).not.toContain("serving worldwide");

    expect(kes).toContain("kes 2,500");
    expect(kes).toContain("m-pesa till 6200945");
    expect(kes).toContain("two (2) revision rounds");
    expect(kes).toContain("48 hours");
    expect(kes).not.toContain("paypal");
    expect(kes).not.toContain("serving worldwide");
  });
});
