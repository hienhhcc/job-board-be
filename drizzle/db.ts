import { env } from 'data/env';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from 'drizzle/schema';

const db = drizzle(env.DB_URL, { schema });

export default db;
