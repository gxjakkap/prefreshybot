import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

console.log({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  database: process.env.PG_DBNAME,
  password: process.env.PG_PASSWORD
});

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    breakpoints: false,
    dbCredentials: {
        host: process.env.PG_HOST!,
        port: Number(process.env.PG_PORT!),
        user: process.env.PG_USER!,
        password: process.env.PG_PASSWORD!,
        database: process.env.PG_DBNAME!,
        ssl: false,
    },
});
