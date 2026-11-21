import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  api,
  apiUrl,
  type Activity,
  type Client,
  type DashboardData,
  type Enquiry,
  type Invoice,
  type Lead,
  type PageRow,
} from "../api";
import { ErrorNote, Logo, SuccessNote } from "../components";

const STATUSES = ["new", "qualified", "quoted", "paid", "in_production", "delivered", "lost"];
const fmt = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <aside className="auth-brand">
        <Logo />
        <div className="auth-brand-copy">
          <p className="overline">Owner access</p>
          <p className="auth-tagline">Guard the entry.</p>
          <p>Leads, clients, pages, invoices and enquiries in one place.</p>
        </div>
        <div className="auth-brand-foot">
          <span className="auth-lock" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          </span>
          <span>Owner access only. Every action is recorded in the activity log.<br />Guard the entry. Move at speed.</span>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-head">
            <span className="badge-soft">Zentry Launchpad</span>
            <h1>Owner sign-in</h1>
            <p className="muted">Use the owner account configured in the private environment file.</p>
          </div>
          <ErrorNote message={error} />
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="login-email">Email address</label>
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-pass">
                <input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                <button className="auth-toggle" type="button" aria-label="Show password" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" />
                  </svg>
                </button>
              </div>
            </div>
            <button className="btn" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="auth-foot">
            <Link to="/">&larr; Back to the public site</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<DashboardData>("/api/admin/dashboard").then(setData).catch((e) => setError(e.message));
  }, []);
  if (error) return <ErrorNote message={error} />;
  if (!data) return <p>Loading…</p>;

  const stats: Array<[string, number]> = [
    ["Leads", data.counts.leads],
    ["New leads", data.counts.newLeads],
    ["Clients", data.counts.clients],
    ["Pages", data.counts.pages],
    ["Enquiries", data.counts.enquiries],
    ["Unread", data.counts.unreadEnquiries],
  ];

  return (
    <>
      <div className="topbar"><h1>Dashboard</h1><Link className="btn sm" to="/admin/leads">Open pipeline</Link></div>
      <div className="stats">{stats.map(([label, value]) => <div className="stat" key={label}><b>{value}</b><span>{label}</span></div>)}</div>
      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="admin-card">
          <h2>Lead pipeline</h2>
          <div className="table-wrap"><table><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>
            {STATUSES.map((status) => <tr key={status}><td><span className="badge">{status.replace("_", " ")}</span></td><td>{data.leadsByStatus[status] || 0}</td></tr>)}
          </tbody></table></div>
        </div>
        <div className="admin-card">
          <h2>Source / conversion</h2>
          {data.sourceStats.length === 0 ? <p className="empty">No leads yet.</p> : (
            <div className="table-wrap"><table><thead><tr><th>Source</th><th>Leads</th><th>Converted</th><th>Rate</th></tr></thead><tbody>
              {data.sourceStats.map((row) => <tr key={row.source}><td>{row.source}</td><td>{row.total}</td><td>{row.converted}</td><td>{row.conversionRate}%</td></tr>)}
            </tbody></table></div>
          )}
        </div>
      </div>
      <div className="grid-2">
        <div className="admin-card">
          <h2>Recent leads</h2>
          {data.recentLeads.length === 0 ? <p className="empty">No leads yet.</p> : (
            <div className="table-wrap"><table><thead><tr><th>Business</th><th>Source</th><th>Received</th></tr></thead><tbody>
              {data.recentLeads.map((lead) => <tr key={lead.id}><td><Link to="/admin/leads">{lead.business || lead.name}</Link></td><td>{lead.source}</td><td>{fmt(lead.created_at)}</td></tr>)}
            </tbody></table></div>
          )}
        </div>
        <div className="admin-card">
          <h2>Recent enquiries</h2>
          {data.recentEnquiries.length === 0 ? <p className="empty">No enquiries yet.</p> : (
            <div className="table-wrap"><table><thead><tr><th>Name</th><th>Page</th><th>Received</th></tr></thead><tbody>
              {data.recentEnquiries.map((row) => <tr key={row.id}><td>{row.name}</td><td><code>/p/{row.slug}</code></td><td>{fmt(row.created_at)}</td></tr>)}
            </tbody></table></div>
          )}
        </div>
      </div>
    </>
  );
}

interface NewClientForm {
  leadId: number;
  businessName: string;
  phone: string;
  address: string;
  service: string;
  currency: "USD" | "KES";
}

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState<NewClientForm | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function load() {
    api<Lead[]>(`/api/admin/leads${filter ? `?status=${filter}` : ""}`).then(setLeads).catch((e) => setError(e.message));
  }
  useEffect(load, [filter]);

  async function changeStatus(lead: Lead, status: string) {
    try {
      await api(`/api/admin/leads/${lead.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setMessage("Status updated.");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  function startClient(lead: Lead) {
    setForm({
      leadId: lead.id,
      businessName: lead.business || lead.name,
      phone: lead.phone,
      address: "",
      service: lead.need.slice(0, 300),
      currency: "USD",
    });
  }

  async function createClient(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setError("");
    try {
      const result = await api<{ id: number }>("/api/admin/clients", {
        method: "POST",
        body: JSON.stringify({
          leadId: form.leadId,
          businessName: form.businessName,
          phone: form.phone,
          address: form.address || "Address to be confirmed",
          service: form.service,
          amount: form.currency === "KES" ? 2500 : 79,
          currency: form.currency,
          paymentStatus: "unpaid",
          paymentRef: "",
        }),
      });
      navigate(`/admin/clients/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create client");
    }
  }

  return (
    <>
      <div className="topbar"><h1>Lead pipeline</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status" style={{ padding: 9, border: "1px solid #cad6df", borderRadius: 8 }}>
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>
      <ErrorNote message={error} /><SuccessNote message={message} />
      <div className="admin-card">
        <div className="table-wrap"><table><thead><tr><th>Business / name</th><th>Contact</th><th>Need</th><th>Source</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td><strong>{lead.business || lead.name}</strong><br /><span className="muted">{lead.name}</span></td>
              <td><a href={`mailto:${lead.email}`}>{lead.email}</a><br /><span className="muted">{lead.phone}</span></td>
              <td style={{ maxWidth: 260 }}>{lead.need}</td>
              <td>{lead.source}</td>
              <td><select aria-label={`Change status for ${lead.business || lead.name}`} value={lead.status} onChange={(e) => changeStatus(lead, e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></td>
              <td>{fmt(lead.created_at)}</td>
              <td><button className="btn sm dark" onClick={() => startClient(lead)}>Make client</button></td>
            </tr>
          ))}
          {leads.length === 0 && <tr><td colSpan={7} className="empty">No leads in this view.</td></tr>}
        </tbody></table></div>

        {form && (
          <form className="inline-form" onSubmit={createClient} style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
            <div className="field"><label htmlFor="new-client-business">Business name</label><input id="new-client-business" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required /></div>
            <div className="field"><label htmlFor="new-client-phone">Phone</label><input id="new-client-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
            <div className="field"><label htmlFor="new-client-address">Address</label><input id="new-client-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Business address" /></div>
            <div className="field"><label htmlFor="new-client-currency">Currency</label><select id="new-client-currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as "USD" | "KES" })}><option value="USD">USD — US$79</option><option value="KES">KES — KES 2,500</option></select></div>
            <div className="field full"><label htmlFor="new-client-service">Service</label><input id="new-client-service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} /></div>
            <div className="full row-actions"><button className="btn" type="submit">Create client</button><button className="btn ghost dark" type="button" onClick={() => setForm(null)}>Cancel</button></div>
          </form>
        )}
      </div>
    </>
  );
}

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api<Client[]>("/api/admin/clients").then(setClients).catch((e) => setError(e.message)); }, []);
  return (
    <>
      <div className="topbar"><h1>Clients</h1><Link className="btn sm" to="/admin/leads">Create from a lead</Link></div>
      <ErrorNote message={error} />
      <div className="admin-card">
        <div className="table-wrap"><table><thead><tr><th>Business</th><th>Phone</th><th>Amount</th><th>Payment</th><th>Reference</th><th></th></tr></thead><tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td><Link to={`/admin/clients/${client.id}`}>{client.business_name}</Link></td>
              <td>{client.phone}</td>
              <td>{client.currency === "KES" ? "KES" : "US$"}{client.amount}</td>
              <td><span className={`badge ${client.payment_status === "paid" ? "teal" : "warn"}`}>{client.payment_status}</span></td>
              <td>{client.payment_ref || "—"}</td>
              <td><Link to={`/admin/pages/new?client=${client.id}`}>Generate page</Link></td>
            </tr>
          ))}
          {clients.length === 0 && <tr><td colSpan={6} className="empty">No clients yet.</td></tr>}
        </tbody></table></div>
      </div>
    </>
  );
}

interface ClientDetailData extends Client {
  pages: PageRow[];
  invoices: Invoice[];
}

export function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState<ClientDetailData | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const navigate = useNavigate();

  function load() {
    api<ClientDetailData>(`/api/admin/clients/${id}`).then(setClient).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    const form = new FormData(event.currentTarget);
    try {
      await api(`/api/admin/clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          businessName: form.get("businessName"),
          phone: form.get("phone"),
          address: form.get("address"),
          service: form.get("service"),
          amount: Number(form.get("amount")),
          currency: form.get("currency"),
          paymentStatus: form.get("paymentStatus"),
          paymentRef: form.get("paymentRef"),
        }),
      });
      setMessage("Client saved.");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function createInvoice() {
    setInvoiceBusy(true);
    setError("");
    try {
      const result = await api<{ number: string }>("/api/admin/invoices", {
        method: "POST",
        body: JSON.stringify({ clientId: Number(id) }),
      });
      setMessage(`Invoice ${result.number} created.`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create invoice");
    } finally {
      setInvoiceBusy(false);
    }
  }

  if (!client) return error ? <ErrorNote message={error} /> : <p>Loading…</p>;

  return (
    <>
      <div className="topbar"><h1>{client.business_name}</h1><Link className="btn sm" to={`/admin/pages/new?client=${client.id}`}>Generate page</Link></div>
      <ErrorNote message={error} /><SuccessNote message={message} />
      <div className="grid-2">
        <form className="admin-card" onSubmit={save}>
          <h2>Client details</h2>
          <div className="field"><label htmlFor="client-business">Business name</label><input id="client-business" name="businessName" defaultValue={client.business_name} required /></div>
          <div className="field"><label htmlFor="client-phone">Phone</label><input id="client-phone" name="phone" defaultValue={client.phone} required /></div>
          <div className="field"><label htmlFor="client-address">Address</label><input id="client-address" name="address" defaultValue={client.address} /></div>
          <div className="field"><label htmlFor="client-service">Service</label><input id="client-service" name="service" defaultValue={client.service} /></div>
          <div className="grid-2">
            <div className="field"><label htmlFor="client-amount">Amount</label><input id="client-amount" name="amount" type="number" step="0.01" defaultValue={client.amount} required /></div>
            <div className="field"><label htmlFor="client-currency">Currency</label><select id="client-currency" name="currency" defaultValue={client.currency}><option value="USD">USD</option><option value="KES">KES</option></select></div>
            <div className="field"><label htmlFor="client-status">Payment status</label><select id="client-status" name="paymentStatus" defaultValue={client.payment_status}><option value="unpaid">unpaid</option><option value="paid">paid</option><option value="refunded">refunded</option></select></div>
            <div className="field"><label htmlFor="client-ref">Payment reference</label><input id="client-ref" name="paymentRef" defaultValue={client.payment_ref} /></div>
          </div>
          <button className="btn">Save client</button>
        </form>
        <div>
          <div className="admin-card">
            <h2>Invoice</h2>
            <p className="muted">Amounts: US$79 or KES 2,500. Kenya pays M-Pesa Till 6200945; international bank details are sent on confirmation.</p>
            <button className="btn dark" onClick={createInvoice} disabled={invoiceBusy}>{invoiceBusy ? "Creating…" : "Create invoice"}</button>
            <div className="table-wrap" style={{ marginTop: 16 }}>
              <table><thead><tr><th>Number</th><th>Status</th><th></th></tr></thead><tbody>
                {client.invoices.map((invoice) => <tr key={invoice.id}><td>{invoice.number}</td><td>{invoice.status}</td><td><a href={apiUrl(`/api/admin/invoices/${invoice.id}`)} target="_blank" rel="noopener">Open invoice</a></td></tr>)}
                {client.invoices.length === 0 && <tr><td colSpan={3} className="empty">No invoices yet.</td></tr>}
              </tbody></table>
            </div>
          </div>
          <div className="admin-card">
            <h2>Generated pages</h2>
            {client.pages.map((page) => <p key={page.id}><Link to={`/admin/pages/${page.id}`}>/p/{page.slug}</Link> <span className="badge">{page.status}</span></p>)}
            {client.pages.length === 0 && <p className="empty">No pages generated yet.</p>}
          </div>
        </div>
      </div>
      <p style={{ marginTop: 10 }}><button className="btn link" onClick={() => navigate("/admin/clients")}>&larr; All clients</button></p>
    </>
  );
}

export function Pages() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { api<PageRow[]>("/api/admin/pages").then(setPages).catch((e) => setError(e.message)); }, []);

  async function update(page: PageRow, status: string) {
    try {
      await api(`/api/admin/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ status, deployedUrl: "" }) });
      setMessage("Page status updated.");
      setPages((rows) => rows.map((p) => (p.id === page.id ? { ...p, status } : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  return (
    <>
      <div className="topbar"><h1>Generated pages</h1><Link className="btn sm" to="/admin/pages/new">Generate a page</Link></div>
      <ErrorNote message={error} /><SuccessNote message={message} />
      <div className="admin-card">
        <div className="table-wrap"><table><thead><tr><th>Page</th><th>Client</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>
          {pages.map((page) => (
            <tr key={page.id}>
              <td><Link to={`/admin/pages/${page.id}`}>/p/{page.slug}</Link></td>
              <td>{page.business_name || `Client #${page.client_id}`}</td>
              <td><select aria-label={`Change status for page ${page.slug}`} value={page.status} onChange={(e) => update(page, e.target.value)}><option value="draft">draft</option><option value="generated">generated</option><option value="deployed">deployed</option><option value="archived">archived</option></select></td>
              <td>{fmt(page.created_at)}</td>
              <td><a href={apiUrl(`/p/${page.slug}`)} target="_blank" rel="noopener">View</a></td>
            </tr>
          ))}
          {pages.length === 0 && <tr><td colSpan={5} className="empty">No pages yet.</td></tr>}
        </tbody></table></div>
      </div>
    </>
  );
}

interface PageConfigState {
  clientId: string;
  businessName: string;
  phone: string;
  address: string;
  serviceBlurb: string;
  accentColor: string;
}

const EMPTY_PAGE: PageConfigState = {
  clientId: "", businessName: "", phone: "", address: "", serviceBlurb: "", accentColor: "#00D6B4",
};

export function PageEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<PageConfigState>({
    ...EMPTY_PAGE,
    clientId: params.get("client") || "",
  });
  const [page, setPage] = useState<{ id: number; slug: string; status?: string } | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  useEffect(() => {
    api<Client[]>("/api/admin/clients").then((rows) => {
      setClients(rows);
      setForm((current) => {
        if (current.clientId || rows.length === 0) return current;
        const first = rows[0]!;
        return { ...current, clientId: String(first.id), businessName: first.business_name, phone: first.phone, address: first.address, serviceBlurb: first.service };
      });
    }).catch((e) => setError(e.message));
    if (!isNew) {
      api<{ id: number; slug: string; status: string; client_id: number; config: PageConfigState }>(`/api/admin/pages/${id}`)
        .then((row) => {
          setPage(row);
          setForm({
            clientId: String(row.client_id),
            businessName: row.config.businessName,
            phone: row.config.phone,
            address: row.config.address,
            serviceBlurb: row.config.serviceBlurb,
            accentColor: row.config.accentColor,
          });
        })
        .catch((e) => setError(e.message));
    }
  }, [id, isNew]);

  function chooseClient(clientId: string) {
    const client = clients.find((c) => String(c.id) === clientId);
    setForm((current) => ({
      ...current,
      clientId,
      businessName: client?.business_name || current.businessName,
      phone: client?.phone || current.phone,
      address: client?.address || current.address,
      serviceBlurb: client?.service || current.serviceBlurb,
    }));
  }

  async function generate(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await api<{ id: number; slug: string }>("/api/admin/pages/generate", {
        method: "POST",
        body: JSON.stringify({ ...form, clientId: Number(form.clientId) }),
      });
      setMessage(`Page generated at /p/${result.slug}`);
      setPage(result);
      navigate(`/admin/pages/${result.id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
  }

  return (
    <>
      <div className="topbar"><h1>{isNew ? "Generate a launch page" : `Page: /p/${page?.slug || ""}`}</h1><Link className="btn sm ghost dark" to="/admin/pages">All pages</Link></div>
      <ErrorNote message={error} /><SuccessNote message={message} />
      <div className="grid-2">
        <form className="admin-card" onSubmit={generate}>
          <h2>Client intake</h2>
          <div className="field"><label htmlFor="page-client">Client</label><select id="page-client" value={form.clientId} onChange={(e) => chooseClient(e.target.value)} required>
            <option value="">Choose a client…</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.business_name}</option>)}
          </select></div>
          <div className="field"><label htmlFor="page-business">Business name</label><input id="page-business" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required /></div>
          <div className="field"><label htmlFor="page-phone">Phone (tap-to-call)</label><input id="page-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
          <div className="field"><label htmlFor="page-address">Address</label><input id="page-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></div>
          <div className="field"><label htmlFor="page-blurb">Service blurb</label><textarea id="page-blurb" value={form.serviceBlurb} onChange={(e) => setForm({ ...form, serviceBlurb: e.target.value })} required /></div>
          <div className="field"><label htmlFor="page-accent">Accent colour</label><input id="page-accent" type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} /></div>
          <button className="btn" disabled={!form.clientId}>Generate page</button>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Output is a mobile-first static page with tap-to-call, address, a three-field enquiry form and Zentry branding. All client text is escaped.</p>
        </form>
        <div>
          {page && (
            <div className="admin-card">
              <h2>Public page</h2>
              <p className="code-line">{apiUrl(`/p/${page.slug}`)}</p>
              <p style={{ marginTop: 12 }}>
                <a href={apiUrl(`/p/${page.slug}`)} target="_blank" rel="noopener">Open public page</a>
                {" · "}
                <a href={apiUrl(`/api/admin/pages/${page.id}/html`)} target="_blank" rel="noopener">View stored HTML</a>
              </p>
            </div>
          )}
          <div className="admin-card">
            <h2>Live preview</h2>
            {page ? <iframe className="preview" title="Generated page preview" src={apiUrl(`/api/admin/pages/${page.id}/html`)} sandbox="allow-forms allow-scripts allow-same-origin" referrerPolicy="no-referrer" /> : <p className="empty">Generate a page to see the preview.</p>}
          </div>
        </div>
      </div>
    </>
  );
}

export function Enquiries() {
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api<Enquiry[]>("/api/admin/enquiries").then(setRows).catch((e) => setError(e.message)); }, []);

  async function mark(row: Enquiry) {
    try {
      await api(`/api/admin/enquiries/${row.id}`, { method: "PATCH", body: JSON.stringify({ notified: !row.notified }) });
      setRows((items) => items.map((item) => (item.id === row.id ? { ...item, notified: item.notified ? 0 : 1 } : item)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  return (
    <>
      <div className="topbar"><h1>Enquiry inbox</h1><span className="muted">Submissions from generated pages, with page slug attached</span></div>
      <ErrorNote message={error} />
      <div className="admin-card">
        <div className="table-wrap"><table><thead><tr><th>Name</th><th>Contact</th><th>Message</th><th>Page / source</th><th>Received</th><th></th></tr></thead><tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.name}</strong></td>
              <td>{row.phone}</td>
              <td style={{ maxWidth: 320 }}>{row.message}</td>
              <td><code>/p/{row.slug}</code><br /><span className="muted">{row.source}</span></td>
              <td>{fmt(row.created_at)}</td>
              <td><button className="btn sm ghost dark" onClick={() => mark(row)}>{row.notified ? "Mark unread" : "Mark read"}</button></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="empty">No enquiries yet.</td></tr>}
        </tbody></table></div>
      </div>
    </>
  );
}

export function Invoices() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api<Invoice[]>("/api/admin/invoices").then(setRows).catch((e) => setError(e.message)); }, []);
  return (
    <>
      <div className="topbar"><h1>Invoices</h1></div>
      <ErrorNote message={error} />
      <div className="admin-card">
        <div className="table-wrap"><table><thead><tr><th>Number</th><th>Client</th><th>Amount</th><th>Status</th><th>Issued</th><th></th></tr></thead><tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.number}</td><td>{row.business_name}</td>
              <td>{row.currency === "KES" ? "KES" : "US$"}{row.amount}</td>
              <td><span className="badge">{row.status}</span></td><td>{fmt(row.issued_at)}</td>
              <td><a href={apiUrl(`/api/admin/invoices/${row.id}`)} target="_blank" rel="noopener">Open / print</a></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="empty">No invoices yet.</td></tr>}
        </tbody></table></div>
        <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>Kenya: M-Pesa Till 6200945 with the client's phone as reference. International: bank details sent on confirmation. Two revision rounds and 48h delivery included.</p>
      </div>
    </>
  );
}

export function Activity() {
  const [rows, setRows] = useState<Activity[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api<Activity[]>("/api/admin/activity").then(setRows).catch((e) => setError(e.message)); }, []);
  return (
    <>
      <div className="topbar"><h1>Activity log</h1></div>
      <ErrorNote message={error} />
      <div className="admin-card">
        <div className="table-wrap"><table><thead><tr><th>When</th><th>Type</th><th>Entity</th><th>Message</th></tr></thead><tbody>
          {rows.map((row) => <tr key={row.id}><td>{fmt(row.created_at)}</td><td><span className="badge">{row.type}</span></td><td>{row.entity}</td><td>{row.message}</td></tr>)}
          {rows.length === 0 && <tr><td colSpan={4} className="empty">No activity yet.</td></tr>}
        </tbody></table></div>
      </div>
    </>
  );
}
