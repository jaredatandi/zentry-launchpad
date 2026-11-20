import { config } from "../config";
import { openDatabase } from "../db";

async function main(): Promise<void> {
  const db = openDatabase(config.dbPath);
  await db.ready;
  const counts = {
    leads: ((await db.prepare("SELECT COUNT(*) AS n FROM leads").get()) as { n: number }).n,
    clients: ((await db.prepare("SELECT COUNT(*) AS n FROM clients").get()) as { n: number }).n,
    pages: ((await db.prepare("SELECT COUNT(*) AS n FROM pages").get()) as { n: number }).n,
  };
  console.log(`[zentry] Database ready at ${config.dbPath}`, counts);
  db.close();
}

main().catch((error) => {
  console.error("[zentry] Database init failed:", error);
  process.exit(1);
});
