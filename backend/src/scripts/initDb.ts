import { config } from "../config";
import { openDatabase } from "../db";

const db = openDatabase(config.dbPath);
const counts = {
  leads: (db.prepare("SELECT COUNT(*) AS n FROM leads").get() as { n: number }).n,
  clients: (db.prepare("SELECT COUNT(*) AS n FROM clients").get() as { n: number }).n,
  pages: (db.prepare("SELECT COUNT(*) AS n FROM pages").get() as { n: number }).n,
};
console.log(`[zentry] Database ready at ${config.dbPath}`, counts);
db.close();
