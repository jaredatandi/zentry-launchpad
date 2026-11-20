import { config, SESSION_COOKIE } from "./config";
import { openDatabase } from "./db";
import { openPostgresDatabase } from "./db/postgres";
import { createApp } from "./app";

// A rejected async handler must never take down the owner's server.
process.on("unhandledRejection", (reason) => {
  console.error("[zentry] Unhandled rejection:", reason);
});

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const db = databaseUrl ? openPostgresDatabase(databaseUrl) : openDatabase(config.dbPath);
  await db.ready;

  const app = createApp(db, {
    sessionSecret: config.sessionSecret,
    adminEmail: config.adminEmail,
    adminPasswordHash: config.adminPasswordHash,
    cookieSecure: config.cookieSecure,
  });

  app.listen(config.port, () => {
    console.log(`[zentry] API listening on http://localhost:${config.port}`);
    console.log(
      databaseUrl
        ? "[zentry] Database: remote Postgres"
        : `[zentry] Database: ${config.dbPath}`,
    );
    console.log(`[zentry] Session cookie: ${SESSION_COOKIE} (HTTP-only)`);
  });
}

main().catch((error) => {
  console.error("[zentry] Failed to start:", error);
  process.exit(1);
});
