import { escapeHtml } from "../lib/escape";
import { priceFor, type Currency } from "../lib/pricing";

export interface InvoiceRow {
  number: string;
  issuedAt: string;
  paidAt: string | null;
  status: string;
  amount: number;
  currency: Currency;
  businessName: string;
  address: string;
  phone: string;
}

export function invoiceAmount(currency: Currency): number {
  return priceFor(currency);
}

export function renderInvoice(row: InvoiceRow): string {
  const isKenya = row.currency === "KES";
  const amount = `${isKenya ? "KES " : "US$"}${Number(row.amount).toLocaleString("en-US")}`;
  const payment = isKenya
    ? `<p>Pay by <strong>M-Pesa Till 6200945</strong>. Use your own phone number as the payment reference, then email the confirmation to <a href="mailto:jaredkeago07@gmail.com">jaredkeago07@gmail.com</a>.</p>`
    : `<p>International payment by bank transfer. <strong>Bank details are sent on confirmation.</strong> No card or subscription is required.</p>`;
  const issued = new Date(row.issuedAt);
  const due = new Date(issued.getTime() + 7 * 24 * 60 * 60 * 1000);

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${escapeHtml(row.number)} — Zentry</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#F6F9FB;color:#102434;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.page{max-width:820px;margin:32px auto;background:#fff;border:1px solid #E2E9EF;border-radius:14px;padding:42px}
.head{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;border-bottom:3px solid #00D6B4;padding-bottom:24px}
.logo{font-size:24px;font-weight:800;color:#08131F;letter-spacing:-.02em}
.logo span{color:#00A98D}
.tag{color:#5A6E80;font-size:12px;font-weight:600}
h1{font-size:28px;margin:28px 0 4px;letter-spacing:-.02em}
.meta{color:#5A6E80;font-size:14px;margin:0 0 28px}
table{width:100%;border-collapse:collapse;margin:0 0 28px}
th,td{text-align:left;padding:12px 8px;border-bottom:1px solid #E2E9EF;font-size:14px}
th{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#5A6E80}
td.num,th.num{text-align:right}
.total{font-weight:800;color:#08131F}
.box{background:#F6F9FB;border:1px solid #E2E9EF;border-radius:10px;padding:18px 20px;margin:18px 0}
.box h2{font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:#08131F;margin:0 0 10px}
.box p{margin:6px 0}
footer{border-top:1px solid #E2E9EF;padding-top:20px;margin-top:32px;color:#5A6E80;font-size:12px}
@media print{body{background:#fff}.page{border:0;margin:0;max-width:none;padding:0}}
</style></head><body><div class="page">
<div class="head"><div><div class="logo">Zentry<span>.</span></div><div class="tag">Guard the entry. Move at speed.</div></div><div style="text-align:right"><strong>INVOICE</strong><div class="tag">${escapeHtml(row.number)}</div></div></div>
<h1>Launch Page</h1>
<p class="meta">One-page mobile holding site &middot; Issued ${escapeHtml(issued.toISOString().slice(0, 10))} &middot; Due ${escapeHtml(due.toISOString().slice(0, 10))} &middot; Status: ${escapeHtml(row.status)}</p>
<table><thead><tr><th>Billed to</th><th>Description</th><th class="num">Amount</th></tr></thead>
<tbody><tr><td><strong>${escapeHtml(row.businessName)}</strong><br>${escapeHtml(row.address)}<br>${escapeHtml(row.phone)}</td><td>One-page holding site with tap-to-call, address and enquiry form. Includes two (2) revision rounds and delivery within 48 hours.</td><td class="num total">${escapeHtml(amount)}</td></tr></tbody></table>
<div class="box"><h2>Payment instructions</h2>${payment}</div>
<div class="box"><h2>What is included</h2><p>&bull; Mobile-first one-page site, built from your details.</p><p>&bull; Two (2) rounds of revisions.</p><p>&bull; Delivery within 48 hours of confirmed details and payment.</p><p>&bull; No subscription and no ongoing fee.</p></div>
<footer>Zentry &middot; jaredkeago07@gmail.com &middot; +254 701 074 998 (call/WhatsApp) &middot; Nairobi, Kenya. Security testing, where requested, is performed only inside written, owner-approved scope naming target and dates.</footer>
</div></body></html>`;
}
