import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from 'drizzle/schema';

const db = drizzle(
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  { schema },
);

export default db;
