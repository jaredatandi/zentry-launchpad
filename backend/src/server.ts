import { config, SESSION_COOKIE } from "./config";
import { openDatabase, openRemoteDatabase } from "./db";
import { createApp } from "./app";

// A rejected async handler must never take down the owner's server.
process.on("unhandledRejection", (reason) => {
  console.error("[zentry] Unhandled rejection:", reason);
});

async function main(): Promise<void> {
  const remoteUrl = process.env.TURSO_DATABASE_URL?.trim();
  const remoteToken = process.env.TURSO_AUTH_TOKEN?.trim();
  const db =
    remoteUrl && remoteToken
      ? openRemoteDatabase(remoteUrl, remoteToken)
      : openDatabase(config.dbPath);
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
      remoteUrl
        ? "[zentry] Database: remote Turso SQLite"
        : `[zentry] Database: ${config.dbPath}`,
    );
    console.log(`[zentry] Session cookie: ${SESSION_COOKIE} (HTTP-only)`);
  });
}

main().catch((error) => {
  console.error("[zentry] Failed to start:", error);
  process.exit(1);
});
