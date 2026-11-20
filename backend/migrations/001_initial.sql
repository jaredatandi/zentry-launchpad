-- Zentry Launchpad initial schema (v1).
-- All timestamps are ISO-8601 UTC strings. Money amounts are integer minor-ish
-- fixed values stored as NUMERIC: USD 79 / KES 2500 for the launch page.

CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL DEFAULT '',
  business    TEXT NOT NULL DEFAULT '',
  need        TEXT NOT NULL DEFAULT '',
  source      TEXT NOT NULL DEFAULT 'website',
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new','qualified','quoted','paid','in_production','delivered','lost')),
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id        INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  business_name  TEXT NOT NULL,
  phone          TEXT NOT NULL,
  address        TEXT NOT NULL DEFAULT '',
  service        TEXT NOT NULL DEFAULT '',
  amount         NUMERIC NOT NULL DEFAULT 79,
  currency       TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','KES')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
                 CHECK (payment_status IN ('unpaid','paid','refunded')),
  payment_ref    TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id    INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  slug         TEXT NOT NULL UNIQUE,
  config_json  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'generated'
               CHECK (status IN ('draft','generated','deployed','archived')),
  deployed_url TEXT NOT NULL DEFAULT '',
  html         TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id    INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  message    TEXT NOT NULL,
  source     TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  notified   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invoices (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  number     TEXT NOT NULL UNIQUE,
  amount     NUMERIC NOT NULL,
  currency   TEXT NOT NULL CHECK (currency IN ('USD','KES')),
  status     TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft','issued','paid','void')),
  issued_at  TEXT NOT NULL,
  paid_at    TEXT
);

CREATE TABLE IF NOT EXISTS activity (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT NOT NULL,
  entity     TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_page ON enquiries(page_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity(created_at);
