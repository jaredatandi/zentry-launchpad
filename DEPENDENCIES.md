# Dependency freedom note (v1)

Every runtime and build dependency below is free and open source. No paid tier,
trial, card, subscription, ad platform or billed API key is used by this project.

| Dependency | Licence | Used for | Free? |
| --- | --- | --- | --- |
| Node.js | MIT | Runtime | Yes |
| React / React DOM | MIT | Frontend UI | Yes |
| React Router | MIT | Frontend routes | Yes |
| Vite | MIT | Frontend dev/build | Yes |
| TypeScript | Apache-2.0 | Both packages | Yes |
| Express | MIT | HTTP API | Yes |
| better-sqlite3 | MIT | Local SQLite database | Yes |
| bcrypt | MIT | Password hashing | Yes |
| jose | MIT | Signed session JWT | Yes |
| zod | MIT | Input validation | Yes |
| dotenv | BSD-2-Clause | `.env` loading | Yes |
| @libsql/client | MIT | Remote SQLite client (Turso) in production | Yes |
| serverless-http | MIT | Runs the Express app on Vercel Functions | Yes |
| Vitest | MIT | Tests | Yes |

Deliberately **not** used: paid email APIs (the app uses mailto links and an
in-app enquiry inbox), paid CAPTCHA (honeypot + rate limit instead), card
processors, ads, or any paid hosting/database tier. The production host is
Vercel Hobby plus a free Turso SQLite database; both have no-card free tiers and
GitHub sign-in. GitHub Pages and a free Cloudflare Tunnel remain valid local/
fallback options.

**Dependencies I was unsure about:** none. The only one worth a second look on a
new machine is `better-sqlite3`, because it contains a native addon: installation
may need a free C++ build toolchain (e.g. Visual Studio Build Tools on Windows)
if a prebuilt binary for your Node version is unavailable. It remains MIT-licensed
and free; no paid service is involved.

No bank details, access tokens or other secrets are stored in this repository.
Secrets live in the gitignored `.env` file.
