import { escapeHtml, telHref } from "../lib/escape";

export interface PageRenderConfig {
  businessName: string;
  phone: string;
  address: string;
  serviceBlurb: string;
  accentColor: string;
}

const SHIELD = `<svg viewBox="0 0 44 52" aria-hidden="true"><path d="M22 2 42 10v18c0 12-8.6 19.4-20 22C10.6 47.4 2 40 2 28V10L22 2Z" fill="#08131F" stroke="ACCENT" stroke-width="2.5"/><path d="M12 16h20l-14 12h14l-20 12 8-12h-8l10-12Z" fill="ACCENT"/></svg>`;

/**
 * Build a complete, standalone mobile-first holding page.
 * Every client-supplied value is escaped; the accent colour is validated by
 * pageConfigSchema before it reaches this function.
 */
export function renderPage(config: PageRenderConfig, pageId: number, slug: string): string {
  const name = escapeHtml(config.businessName);
  const phone = escapeHtml(config.phone);
  const address = escapeHtml(config.address);
  const blurb = escapeHtml(config.serviceBlurb);
  const accent = escapeHtml(config.accentColor);
  const href = escapeHtml(telHref(config.phone));
  const safeSlug = escapeHtml(slug);
  const shield = SHIELD.replaceAll("ACCENT", accent);
  const title = `${config.businessName} — contact us`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${blurb}">
<meta name="theme-color" content="${accent}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 52'%3E%3Cpath d='M22 2 42 10v18c0 12-8.6 19.4-20 22C10.6 47.4 2 40 2 28V10L22 2Z' fill='%2308131F' stroke='${accent.slice(1)}' stroke-width='3'/%3E%3C/svg%3E">
<style>
:root{--accent:${accent};--navy:#08131F;--ink:#152431;--muted:#5D6F7E;--line:#D8E1E7;--bg:#F7F8F6;--radius:6px}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--accent)}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.wrap{width:100%;max-width:720px;margin:0 auto;padding:0 20px}
.strip{background:var(--navy);color:#A9BBC8;font-size:12px;padding:9px 0}
.strip .wrap{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.strip svg{width:15px;height:18px;flex:none}
header{background:var(--navy);color:#fff;padding:52px 0 58px}
.brand{display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:800;letter-spacing:-.02em;text-decoration:none;margin-bottom:30px}
.brand svg{width:22px;height:26px}
h1{font-size:clamp(30px,7vw,46px);line-height:1.12;letter-spacing:-.025em;margin:0 0 14px}
.sub{color:#C1D0DC;font-size:17px;max-width:36ch;margin:0}
.call{display:flex;align-items:center;justify-content:center;gap:10px;min-height:56px;margin:30px 0 12px;border-radius:var(--radius);background:var(--accent);color:#04231E;font-weight:800;font-size:17px;text-decoration:none}
.call:hover{filter:brightness(1.06)}
.where{color:#C1D0DC;font-size:14px;text-align:center;margin:0}
section{padding:42px 0}
h2{font-size:24px;letter-spacing:-.02em;margin:0 0 10px}
p.lead{color:var(--muted);margin:0 0 22px}
form{display:grid;gap:14px;background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:22px}
label{display:block;font-size:13px;font-weight:700;margin-bottom:6px}
input,textarea{width:100%;font:inherit;font-size:16px;color:var(--ink);background:#fff;border:1px solid #CFD8DE;border-radius:var(--radius);padding:12px 13px}
textarea{min-height:110px;resize:vertical}
button{min-height:50px;border:0;border-radius:var(--radius);background:var(--navy);color:#fff;font:inherit;font-weight:700;cursor:pointer}
button:hover{background:#10283C}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
#status{margin:12px 0 0;font-size:14px;font-weight:600;min-height:1.4em}
.upcoming{background:var(--navy);color:#fff}
.upcoming h2{color:#fff}
.upcoming p{color:#C1D0DC;font-size:14px;margin:0}
footer{background:#050E17;color:#8FA1B2;font-size:12px;padding:26px 0;text-align:center}
footer a{color:var(--accent)}
@media(min-width:600px){header{padding:70px 0}form{grid-template-columns:1fr 1fr}form .full{grid-column:1/-1}}
</style>
</head>
<body>
<div class="strip"><div class="wrap">${shield}<span>Our new website is on its way — you can reach us today.</span></div></div>
<header><div class="wrap">
<a class="brand" href="/p/${safeSlug}">${shield}<span>Zentry page</span></a>
<h1>${name}</h1>
<p class="sub">${blurb}</p>
<a class="call" href="${href}">Call ${phone}</a>
<p class="where">${address}</p>
</div></header>
<main>
<section><div class="wrap">
<h2>Send an enquiry</h2>
<p class="lead">Tell us what you need and we will get straight back to you.</p>
<form id="enquiry" action="/api/enquiries" method="post">
<div><label for="f-name">Your name</label><input id="f-name" name="name" maxlength="100" autocomplete="name" required></div>
<div><label for="f-phone">Phone or email</label><input id="f-phone" name="phone" maxlength="120" autocomplete="tel" required></div>
<div class="full"><label for="f-message">What do you need?</label><textarea id="f-message" name="message" maxlength="2000" required></textarea></div>
<div class="hp" aria-hidden="true"><label for="f-website">Leave this blank</label><input id="f-website" name="website" tabindex="-1" autocomplete="off"></div>
<input type="hidden" name="website_time" value="">
<input type="hidden" name="pageId" value="${pageId}">
<input type="hidden" name="source" value="page:${safeSlug}">
<div class="full"><button type="submit">Send enquiry</button></div>
</form>
<p id="status" role="status" aria-live="polite"></p>
</div></section>
<section class="upcoming"><div class="wrap">
<h2>Our new website is on its way</h2>
<p>Until it launches, call or send an enquiry above and we will get straight back to you. This page was built and is hosted by Zentry — Guard the entry. Move at speed.</p>
</div></section>
</main>
<footer><div class="wrap">Page by <a href="https://jaredatandi.github.io/zentry-site/" rel="noopener">Zentry</a> &middot; Guard the entry. Move at speed.</div></footer>
<script>
(function(){
  var form=document.getElementById('enquiry'),status=document.getElementById('status'),started=Date.now();
  form.addEventListener('submit',function(e){
    e.preventDefault();
    status.textContent='Sending…';
    var data=new URLSearchParams(new FormData(form));
    data.set('elapsed',String(Date.now()-started));
    fetch(form.action,{method:'POST',body:data,headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json'}})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,body:j};});})
      .then(function(res){
        if(res.ok){form.reset();status.textContent='Thank you — we will be in touch shortly.';}
        else{status.textContent=res.body&&res.body.error?res.body.error:'Could not send. Please call us instead.';}
      })
      .catch(function(){status.textContent='Could not send. Please call us instead.';});
  });
})();
</script>
</body>
</html>
`;
}
