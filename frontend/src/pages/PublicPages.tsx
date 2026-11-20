import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { ErrorNote, SuccessNote } from "../components";

/* Small, consistent line icons — no external icon service, no paid assets. */
type IconProps = { className?: string };
const icon = (paths: ReactNode) =>
  function Icon({ className }: IconProps) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paths}
      </svg>
    );
  };

const CodeIcon = icon(<><path d="m8 17-5-5 5-5M16 7l5 5-5 5M14 4l-4 16" /></>);
const ShieldIcon = icon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>);
const RocketIcon = icon(<><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-5 5-9 12-10 1 7-3 11-8 12l-1 1Z" /><circle cx="14.5" cy="9.5" r="1.5" /></>);
const PhoneIcon = icon(<><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" /></>);
const MailIcon = icon(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></>);
const CheckIcon = icon(<><path d="m5 13 4 4L19 7" /></>);
const CpuIcon = icon(<><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>);

const PLATFORMS = ["Web apps", "Android", "iOS", "Windows", "macOS", "Linux", "APIs & integrations", "Cloud & CI/CD"];

export function Home() {
  return (
    <>
      <header className="hero">
        <div className="container">
          <div>
            <p className="overline">Software engineering · Cybersecurity · Nairobi</p>
            <h1>Software that holds up. <em>Systems that stay safe.</em></h1>
            <p className="lede">
              Zentry builds <strong>web apps, mobile apps, desktop software, APIs and cloud systems</strong> — then secures them with practical AppSec and written-scope security reviews. One senior team takes the work from first conversation to production.
            </p>
            <div className="cta-row">
              <Link className="btn" to="/contact">Start a project &rarr;</Link>
              <Link className="btn ghost" to="/demo">See a finished page</Link>
            </div>
            <div className="hero-contact">
              <a href="tel:+254701074998"><PhoneIcon /> +254 701 074 998</a>
              <a href="mailto:jaredkeago07@gmail.com"><MailIcon /> jaredkeago07@gmail.com</a>
            </div>
          </div>

          <aside className="hero-visual" aria-label="What Zentry delivers">
            <div className="visual-head"><span>Delivery snapshot</span><b>Zentry / v1</b></div>
            <div className="visual-row"><span className="k">Build</span><span className="v"><b>Web &amp; mobile</b> · Android, iOS, responsive front ends</span></div>
            <div className="visual-row"><span className="k">Devices</span><span className="v"><b>Desktop</b> · Windows, macOS, Linux</span></div>
            <div className="visual-row"><span className="k">Connect</span><span className="v"><b>APIs &amp; cloud</b> · integrations, CI/CD, automation</span></div>
            <div className="visual-row"><span className="k">Secure</span><span className="v"><b>AppSec</b> · secure reviews, threat modelling, DevSecOps</span></div>
            <div className="visual-row"><span className="k">Deliver</span><span className="v"><b>Written scope</b> · tested, documented, handed over</span></div>
            <div className="visual-foot"><span>Fixed quote</span><span>48h launch pages</span><span>Two revisions</span><span>Nairobi, KE</span></div>
          </aside>
        </div>
      </header>

      <div className="trust">
        <div className="container">
          <div className="trust-item"><CheckIcon /><div><b>48-hour launch pages</b><span>One clear page, live fast — not a months-long project.</span></div></div>
          <div className="trust-item"><ShieldIcon /><div><b>Scope you can sign</b><span>Fixed quote and written scope before any work begins.</span></div></div>
          <div className="trust-item"><CpuIcon /><div><b>Senior hands on the tools</b><span>The people who scope the work build and secure it.</span></div></div>
          <div className="trust-item"><RocketIcon /><div><b>Built for real devices</b><span>Browser, phone, tablet, Windows, macOS and Linux.</span></div></div>
        </div>
      </div>

      <section className="block">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What we do</p>
            <h2>Engineering and security, together.</h2>
            <p>Most teams build a product and hand it over. We work both sides — so the software is sound, and the risks are understood before they become incidents.</p>
          </div>
          <div className="grid-3">
            <article className="service-card">
              <span className="service-icon"><CodeIcon /></span>
              <span className="idx">01 / SOFTWARE DEVELOPMENT</span>
              <h3>Products that survive real use.</h3>
              <p className="sub">From first sketch to production, built to be maintained afterwards.</p>
              <ul>
                <li>Web applications and customer portals</li>
                <li>Android and iOS mobile apps</li>
                <li>Windows, macOS and Linux desktop apps</li>
                <li>REST APIs, integrations and backend services</li>
                <li>Cloud deployment, CI/CD and automation</li>
                <li>Code review, refactoring and technical takeovers</li>
              </ul>
            </article>
            <article className="service-card alt">
              <span className="service-icon"><ShieldIcon /></span>
              <span className="idx">02 / CYBERSECURITY</span>
              <h3>Find the gaps while they are cheap to fix.</h3>
              <p className="sub">Security built into the work, not bolted on after launch.</p>
              <ul>
                <li>Application security and secure code reviews</li>
                <li>Vulnerability assessment and remediation plans</li>
                <li>Threat modelling and security architecture</li>
                <li>DevSecOps checks inside your delivery pipeline</li>
                <li>Incident-response support and hardening</li>
                <li>Authorised web and API assessments</li>
              </ul>
              <p className="service-note">All testing happens only inside written, owner-approved scope naming the target and dates. No exceptions.</p>
            </article>
            <article className="service-card">
              <span className="service-icon"><RocketIcon /></span>
              <span className="idx">03 / LAUNCH PAGE FACTORY</span>
              <h3>One clear page. Live in 48 hours.</h3>
              <p className="sub">For businesses whose real site is still in progress — or who need one page that converts.</p>
              <ul>
                <li>Mobile-first one-page site from your details</li>
                <li>Tap-to-call phone and full address</li>
                <li>Three-field enquiry form into our admin inbox</li>
                <li>Two revision rounds included</li>
                <li>US$79 / KES 2,500, no subscription</li>
              </ul>
              <p className="service-note"><Link to="/launch-page">See exactly what is included &rarr;</Link></p>
            </article>
          </div>
        </div>
      </section>

      <section className="platforms">
        <div className="container">
          <p className="overline">Built for the devices your customers use</p>
          <h2>One team across your whole stack.</h2>
          <p>We do not hand you to a separate mobile, desktop or security vendor. The same senior engineers design, build, connect and secure the work.</p>
          <div className="chips">
            {PLATFORMS.map((platform) => (
              <span className="chip" key={platform}><CheckIcon /> {platform}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Why Zentry</p>
            <h2>A partner, not a marketplace.</h2>
            <p>Small team, senior people, clear commitments. You work with the people who actually do the work.</p>
          </div>
          <div className="grid-3">
            <div className="pillar"><span className="n">01</span><h4>Both sides in one room</h4><p>Engineering and security happen together. Weaknesses are caught during the build, not after a breach.</p></div>
            <div className="pillar"><span className="n">02</span><h4>Scope you can sign</h4><p>Written scope, fixed quote and timeline before anything starts. No surprise invoices.</p></div>
            <div className="pillar"><span className="n">03</span><h4>Senior hands on the work</h4><p>The people who scope your project are the people who build, test and hand it over.</p></div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How we work</p>
            <h2>Four steps, no theatre.</h2>
            <p>A short process so you always know where things stand and what happens next.</p>
          </div>
          <div className="steps">
            <div className="step-card"><h4>Discuss</h4><p>Tell us the problem, the platforms you need and the deadline. A call or an email is enough.</p></div>
            <div className="step-card"><h4>Scope</h4><p>We send a written scope, fixed quote and timeline for your approval before work starts.</p></div>
            <div className="step-card"><h4>Build &amp; secure</h4><p>We develop, review and test — including security checks where they matter and are authorised.</p></div>
            <div className="step-card"><h4>Deliver</h4><p>We hand over the code, access and documentation, then stay available for the follow-up.</p></div>
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="narrow">
          <div className="ethics">
            <h3>Responsible security work</h3>
            <p>We only assess systems you own, or that you have explicit written permission to assess, and only inside an agreed scope. <b>No exceptions.</b> For security work we agree the rules of engagement first — target, dates and boundaries — because that protects you, your users and us. This site does not perform scanning or testing of any kind.</p>
          </div>
        </div>
      </section>

      <section className="block" id="engage">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Ways to work together</p>
            <h2>Start small. Stay for the hard parts.</h2>
            <p>A fixed-price entry point, and a senior team for the software and security work that follows.</p>
          </div>
          <div className="grid-2">
            <div className="offer featured">
              <span className="badge-soft">Fixed price · 48 hours</span>
              <div className="price">US$79 <small>/ KES 2,500</small></div>
              <h3>Launch Page</h3>
              <p className="muted" style={{ fontSize: 14 }}>A one-page mobile site with tap-to-call, address, three-field enquiry form and Zentry branding.</p>
              <ul>
                <li>Delivered within 48 hours of confirmed details</li>
                <li>Two revision rounds included</li>
                <li>No subscription or ongoing fee</li>
                <li>Kenya: M-Pesa Till 6200945. International: bank details sent on confirmation.</li>
              </ul>
              <Link className="btn" to="/contact">Order a launch page &rarr;</Link>
            </div>
            <div className="offer">
              <span className="badge-soft">Fixed scope · quoted</span>
              <div className="price">Project work <small>/ quoted</small></div>
              <h3>Software &amp; security engagements</h3>
              <p className="muted" style={{ fontSize: 14 }}>Web, Android, iOS, Windows, macOS, Linux, APIs, cloud — with AppSec woven in where it matters.</p>
              <ul>
                <li>New products, rebuilds and technical takeovers</li>
                <li>Secure code review, threat modelling and remediation plans</li>
                <li>DevSecOps checks in your delivery pipeline</li>
                <li>Written scope and fixed quote before any work begins</li>
              </ul>
              <Link className="btn outline" to="/contact">Tell us about the project &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="narrow">
          <div className="section-head"><p className="eyebrow">Good questions</p><h2>Before you get in touch.</h2></div>
          <details className="faq"><summary>Do you only build websites?</summary><p>No. We build web apps and portals, Android and iOS apps, desktop software for Windows, macOS and Linux, APIs and cloud delivery pipelines. The US$79 launch page is our small, fixed-price entry point.</p></details>
          <details className="faq"><summary>Can you work with our existing code and team?</summary><p>Yes. Code review, refactoring and technical takeovers are part of the work. We can join an existing repository, follow your conventions and hand back clean, documented changes.</p></details>
          <details className="faq"><summary>How does payment work?</summary><p>For Kenya, pay by M-Pesa Till 6200945 using your own phone number as the reference. For international clients, payment is by bank transfer; details are sent on confirmation. No card, subscription or ad spend is involved.</p></details>
          <details className="faq"><summary>Do you do security testing?</summary><p>Only inside written, owner-approved scope that names the target and dates. We start with secure design reviews, code review and threat modelling. We do not scan or test systems outside that agreement, and this site contains no testing tools.</p></details>
          <details className="faq"><summary>What is the launch page turnaround?</summary><p>48 hours from confirmed details and payment, with two rounds of revisions included. Send the business name, phone, address and a short service description and we will take it from there.</p></details>
        </div>
      </section>

      <section className="contact-band">
        <div className="container">
          <p className="overline">Get in touch</p>
          <h2>Tell us what you are building.</h2>
          <p className="intro">A product, a security review, or one clear page this week. We reply within two hours during Nairobi business hours.</p>
          <div className="grid-3 cgrid">
            <div className="cbox"><div className="l">Call / WhatsApp</div><a href="tel:+254701074998">+254 701 074 998</a><small>Fastest way to reach us</small></div>
            <div className="cbox"><div className="l">Email</div><a href="mailto:jaredkeago07@gmail.com">jaredkeago07@gmail.com</a><small>Attach a brief if you have one</small></div>
            <div className="cbox"><div className="l">Office</div><strong>Nairobi, Kenya</strong><small>Working across time zones</small></div>
          </div>
          <p className="pay">Payment is by international bank transfer, or by M-Pesa Till <code>6200945</code> for clients in Kenya. Bank details are supplied on confirmation. No subscriptions and no card required.</p>
          <div className="cta-row"><Link className="btn" to="/contact">Send an enquiry &rarr;</Link><a className="btn ghost" href="mailto:jaredkeago07@gmail.com?subject=Project%20enquiry">Email the owner</a></div>
        </div>
      </section>
    </>
  );
}

export function Guide() {
  return (
    <>
      <div className="guide-hero">
        <div className="narrow">
          <p className="overline">Zentry field guide</p>
          <h1>Your website says “coming soon”. Now what?</h1>
          <p>A short, practical checklist for businesses whose new site is still being built — and who still need the phone to ring.</p>
          <p><Link className="btn sm" to="/contact">Request the example and quote</Link></p>
        </div>
      </div>
      <section className="block">
        <div className="narrow prose">
          <p>If your site is a holding page, a visitor has usually made up their mind in about five seconds. They either find a way to contact you, or they leave. A “coming soon” banner with nothing underneath reads as “not open yet” — even when you are taking bookings today.</p>
          <p><strong>The fix is not a full website.</strong> It is one clear page that answers four questions: who you are, where you are, how to reach you right now, and what to do next.</p>
          <h2>What a holding page must contain</h2>
          <ul>
            <li><strong>Your name and what you do</strong> — one line, no jargon. “Family dentistry in Riverside” beats “exceptional dentistry, beautifully personal”.</li>
            <li><strong>A tappable phone number</strong> — on a phone, a number must be a link that opens the dialler, not text someone has to select.</li>
            <li><strong>Your address</strong> — with the postcode. People check distance before they call.</li>
            <li><strong>One action</strong> — a short enquiry form (name, contact, message) or a Book button. Not both competing for attention.</li>
            <li><strong>An honest line about the new site</strong> — “Our new website is on its way. In the meantime, call or send a short enquiry and we'll get straight back to you.”</li>
          </ul>
          <h2>Three mistakes that cost enquiries</h2>
          <ul>
            <li><strong>Banner plus half-built pages.</strong> A “coming soon” banner above live service pages sends two messages at once. Pick one story.</li>
            <li><strong>Email only.</strong> “Please email us” loses the people who want to speak to a human now.</li>
            <li><strong>No next step on mobile.</strong> If the call button is not tappable and the form has five fields, the visitor bounces.</li>
          </ul>
          <h2>See a finished example</h2>
          <p>We built a complete demo holding page — a fictional dental practice — so you can see exactly what this looks like on a phone before deciding anything.</p>
          <p><Link className="btn" to="/demo">View the live example &rarr;</Link></p>
          <h2>If you need more than a page</h2>
          <p>Zentry is a software engineering and cybersecurity company. Alongside the 48-hour launch page, we build web apps, Android and iOS apps, Windows, macOS and Linux desktop software, APIs and cloud systems — with AppSec and written-scope security reviews where they matter.</p>
          <p>Zentry builds the one-page mobile site from details that are already public about your business. US$79 (KES 2,500 in Kenya), two revisions, no subscription. Bank transfer internationally; M-Pesa Till 6200945 in Kenya.</p>
          <p>Email <a href="mailto:jaredkeago07@gmail.com">jaredkeago07@gmail.com</a> or WhatsApp/call +254 701 074 998 and say “holding page”. We'll send the example page and a quote — no obligation.</p>
        </div>
      </section>
    </>
  );
}

export function LaunchPage() {
  return (
    <section className="block">
      <div className="narrow">
        <p className="eyebrow">US$79 / KES 2,500 · 48 hours</p>
        <h1 className="sec">The one-page launch service</h1>
        <p className="intro">A fast, focused web presence for businesses whose real site is still in progress — or who simply need one clear page that turns visitors into calls. Built by Zentry, a software engineering and cybersecurity company.</p>
        <div className="grid-2">
          <div className="service-card">
            <span className="service-icon"><CheckIcon /></span>
            <h3>What you get</h3>
            <ul>
              <li>Mobile-first one-page site built from your details</li>
              <li>Tap-to-call phone button and full address</li>
              <li>Three-field enquiry form delivered to our admin inbox</li>
              <li>Service blurb and your accent colour</li>
              <li>Zentry branding and a link to our work</li>
              <li>Two revision rounds</li>
              <li>Delivery within 48 hours of confirmed details</li>
            </ul>
          </div>
          <div className="service-card">
            <span className="service-icon"><ShieldIcon /></span>
            <h3>Simple payment, no subscription</h3>
            <p>Kenya: pay by M-Pesa Till <strong>6200945</strong>, using your own phone number as the reference.</p>
            <p>International: bank transfer. Bank details are sent on confirmation — never published here.</p>
            <p>Two revisions and 48h delivery are included. No card, no ongoing fee, no ad spend.</p>
            <Link className="btn" to="/contact">Order a launch page &rarr;</Link>
          </div>
        </div>
        <div className="ethics" style={{ marginTop: 26 }}>
          <h3>Need more than one page?</h3>
          <p>We also build web apps, Android and iOS apps, desktop tools for Windows, macOS and Linux, APIs and cloud systems — plus secure code reviews and written-scope security work. <Link to="/contact" style={{ color: "var(--teal-b)" }}>Tell us what you are building &rarr;</Link></p>
        </div>
        <p style={{ marginTop: 26 }}><Link className="btn outline" to="/demo">See the live example first</Link></p>
      </div>
    </section>
  );
}

export function Demo() {
  return (
    <>
      <div style={{ background: "#10283c", color: "#a9bbc8", fontSize: 13, padding: "10px 0" }}>
        <div className="container">DEMO — fictional business, built by Zentry as a working example &middot; <Link to="/holding-page">Read the guide</Link></div>
      </div>
      <section className="block" style={{ paddingTop: 34 }}>
        <div className="narrow">
          <div className="service-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "radial-gradient(500px 200px at 85% 0, rgba(0,214,180,.16), transparent 70%), #08131f", color: "#fff", padding: "44px 30px" }}>
              <p className="overline">A real launch page</p>
              <h1 style={{ fontSize: "clamp(29px,5vw,44px)", margin: "0 0 10px" }}>Riverside Dental Practice</h1>
              <p style={{ color: "#c1d0dc" }}>Family dentistry in Riverside — open and taking appointments</p>
              <a className="btn" href="tel:+441234567890" style={{ marginTop: 12 }}>&#128222; Call 01234 567 890</a>
              <p style={{ color: "#c1d0dc", fontSize: 14, marginTop: 14 }}>18 Mill Lane, Riverside, RV1 2AB &middot; Mon–Fri 8:30–5:30</p>
            </div>
            <div style={{ padding: 28 }}>
              <h2>Send an enquiry</h2>
              <p className="muted">Call us or send a short enquiry. We reply the same day.</p>
              <div className="form-card">
                <div className="field"><label htmlFor="demo-name">Your name</label><input id="demo-name" placeholder="Name" /></div>
                <div className="field"><label htmlFor="demo-contact">Phone or email</label><input id="demo-contact" placeholder="Phone or email" /></div>
                <div className="field"><label htmlFor="demo-need">What do you need?</label><textarea id="demo-need" placeholder="e.g. a check-up for my daughter" /></div>
                <button className="btn" disabled>Send enquiry</button>
                <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Demo form — nothing is submitted. A real generated page sends enquiries straight to the Zentry admin inbox with the page slug attached.</p>
              </div>
              <h2 style={{ marginTop: 34 }}>Our new website is on its way</h2>
              <p className="muted">Until it launches, call or send an enquiry above and we'll get straight back to you. Existing patients: please call the same number for urgent care.</p>
            </div>
          </div>
          <p style={{ marginTop: 20, textAlign: "center", fontSize: 13 }}>Example page by Zentry — <Link to="/holding-page">what we do</Link> · Guard the entry. Move at speed.</p>
        </div>
      </section>
    </>
  );
}

export function Contact() {
  const started = useRef(Date.now());
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      if (typeof value === "string") data.set(key, value);
    });
    data.set("elapsed", String(Date.now() - started.current));
    setBusy(true);
    try {
      await api<{ ok: boolean }>("/api/leads", { method: "POST", body: data });
      form.reset();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your enquiry");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="block">
      <div className="narrow">
        <p className="eyebrow">Get in touch</p>
        <h1 className="sec">Tell us what you are building.</h1>
        <p className="intro">A web app, an Android or desktop tool, a security review, or one clear page this week. We reply within two hours during Nairobi business hours.</p>
        {done && <SuccessNote message="Thank you — your enquiry is in. We will be in touch shortly." />}
        <ErrorNote message={error} />
        <form className="form-card" onSubmit={submit}>
          <div className="grid-2">
            <div className="field"><label htmlFor="name">Your name *</label><input id="name" name="name" maxLength={100} autoComplete="name" required /></div>
            <div className="field"><label htmlFor="email">Email *</label><input id="email" name="email" type="email" maxLength={254} autoComplete="email" required /></div>
            <div className="field"><label htmlFor="phone">Phone / WhatsApp *</label><input id="phone" name="phone" maxLength={120} autoComplete="tel" required /></div>
            <div className="field"><label htmlFor="business">Business *</label><input id="business" name="business" maxLength={150} autoComplete="organization" required /></div>
            <div className="field"><label htmlFor="source">How did you find us?</label>
              <select id="source" name="source" defaultValue="website">
                <option value="website">Website</option><option value="google">Google search</option>
                <option value="facebook">Facebook</option><option value="reddit">Reddit</option>
                <option value="linkedin">LinkedIn</option><option value="referral">Referral</option>
                <option value="existing-client">Existing client</option><option value="other">Other</option>
              </select>
            </div>
            <div className="field full"><label htmlFor="need">What do you need? *</label><textarea id="need" name="need" maxLength={2000} required placeholder="Tell us about the web, mobile, desktop, API, cloud or security work you need" /></div>
          </div>
          <div className="hp" aria-hidden="true"><label htmlFor="website">Leave this blank</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
          <button className="btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Send enquiry"}</button>
          <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>No subscriptions, no card. Kenya: M-Pesa Till 6200945. International: bank details sent on confirmation.</p>
        </form>
      </div>
    </section>
  );
}
