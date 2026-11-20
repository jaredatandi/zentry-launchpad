import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { api, apiUrl } from "./api";

export const SHIELD_PATHS = (
  <>
    <path d="M22 2 42 10v18c0 12-8.6 19.4-20 22C10.6 47.4 2 40 2 28V10L22 2Z" fill="#08131F" stroke="#00D6B4" strokeWidth="2.5" />
    <path d="M12 16h20l-14 12h14l-20 12 8-12h-8l10-12Z" fill="#00D6B4" />
  </>
);

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Zentry home">
      <svg viewBox="0 0 44 52" aria-hidden="true">{SHIELD_PATHS}</svg>
      <span>Zentry<i>.</i></span>
    </Link>
  );
}

const NAV = [
  { to: "/holding-page", label: "Holding-page guide" },
  { to: "/demo", label: "Live example" },
  { to: "/launch-page", label: "$79 launch page" },
  { to: "/contact", label: "Contact" },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <nav className="nav" aria-label="Main">
        <div className="container">
          <Logo />
          <div className="nav-links">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
            ))}
          </div>
          <Link className="btn sm nav-cta" to="/contact">Start a project &rarr;</Link>
          <button className="menu-btn" aria-label="Toggle menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </div>
        {open && (
          <div className="m-menu open" id="mobile-menu" ref={menuRef}>
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>{item.label}</Link>
            ))}
            <Link className="btn" to="/contact" onClick={() => setOpen(false)}>Start a project &rarr;</Link>
          </div>
        )}
      </nav>
      <main id="main"><Outlet /></main>
      <footer className="site">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Logo />
              <p>Software engineering and cybersecurity. We build products and secure them — from Nairobi.</p>
              <span className="tagline">Guard the entry. Move at speed.</span>
            </div>
            <div>
              <h2>Explore</h2>
              <Link to="/holding-page">Free guide</Link>
              <Link to="/demo">Live example</Link>
              <Link to="/launch-page">$79 launch page</Link>
            </div>
            <div>
              <h2>Company</h2>
              <a href="https://jaredatandi.github.io/zentry-site/" rel="noopener">Original site</a>
              <a href="https://github.com/jaredatandi/zentry-site" rel="noopener">GitHub</a>
              <Link to="/contact">Contact</Link>
            </div>
            <div>
              <h2>Contact</h2>
              <a href="tel:+254701074998">+254 701 074 998</a>
              <a href="mailto:jaredkeago07@gmail.com">jaredkeago07@gmail.com</a>
              <span>Nairobi, Kenya</span>
            </div>
          </div>
          <div className="fbot">
            <p>&copy; {new Date().getFullYear()} Zentry. All rights reserved.</p>
            <p>Security testing is performed only within agreed, written scope.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return message ? <div className="notice error" role="alert">{message}</div> : null;
}

export function SuccessNote({ message }: { message: string }) {
  return message ? <div className="notice success" role="status">{message}</div> : null;
}

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/leads", label: "Leads" },
  { to: "/admin/clients", label: "Clients" },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/enquiries", label: "Enquiries" },
  { to: "/admin/invoices", label: "Invoices" },
  { to: "/admin/activity", label: "Activity" },
];

export function RequireAuth({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"checking" | "ok" | "no">("checking");
  useEffect(() => {
    api("/api/admin/dashboard")
      .then(() => setState("ok"))
      .catch(() => setState("no"));
  }, []);
  if (state === "checking") return <div className="admin"><div className="main"><p>Checking access…</p></div></div>;
  if (state === "no") return <NavigateToLogin />;
  return <>{children}</>;
}

function NavigateToLogin() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/admin/login", { replace: true }); }, [navigate]);
  return null;
}

export function AdminLayout() {
  const navigate = useNavigate();
  async function logout() {
    await api("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    navigate("/admin/login", { replace: true });
  }
  return (
    <div className="admin">
      <a className="skip" href="#main">Skip to content</a>
      <aside className="side">
        <Logo />
        <nav>
          {ADMIN_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <a href={apiUrl("/")} target="_blank" rel="noopener">View public site</a>
          <div style={{ marginTop: 10 }}>
            <button className="btn sm ghost" onClick={logout}>Sign out</button>
          </div>
        </div>
      </aside>
      <main className="main" id="main"><Outlet /></main>
    </div>
  );
}
