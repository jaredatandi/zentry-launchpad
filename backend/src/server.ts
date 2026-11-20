import { config, SESSION_COOKIE } from "./config";
import { openDatabase } from "./db";
import { createApp } from "./app";

// A rejected async handler must never take down the owner's server.
process.on("unhandledRejection", (reason) => {
  console.error("[zentry] Unhandled rejection:", reason);
});

const db = openDatabase(config.dbPath);
const app = createApp(db, {
  sessionSecret: config.sessionSecret,
  adminEmail: config.adminEmail,
  adminPasswordHash: config.adminPasswordHash,
  cookieSecure: config.cookieSecure,
});

app.listen(config.port, () => {
  console.log(`[zentry] API listening on http://localhost:${config.port}`);
  console.log(`[zentry] Database: ${config.dbPath}`);
  console.log(`[zentry] Session cookie: ${SESSION_COOKIE} (HTTP-only)`);
});
