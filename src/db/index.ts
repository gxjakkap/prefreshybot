import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DBNAME}`;

const pool = new pg.Pool({ connectionString });

export const db = drizzle(pool);