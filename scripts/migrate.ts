import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import 'dotenv/config';

const pool = new pg.Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DBNAME,
  ssl: false,
});

const db = drizzle(pool);

console.log("Running migrations...");
try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied successfully!");
} catch (e) {
  console.error("Migration error:", e);
  process.exit(1);
} finally {
  await pool.end();
}
