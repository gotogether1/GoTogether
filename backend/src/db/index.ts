import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = env.DATABASE_URL
  ? new Pool({
      connectionString: env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : null;

export async function query(text: string, params?: any[]) {
  if (!pool) {
    console.warn('⚠️ DATABASE_URL not set, database query skipped.');
    return { rows: [] };
  }
  return pool.query(text, params);
}
