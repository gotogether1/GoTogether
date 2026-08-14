import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

const { Pool } = pg;

export async function initializeDatabase() {
  const connectionString = env.DATABASE_URL;

  if (!connectionString) {
    console.log('⚠️ DATABASE_URL not provided. Skipping PostgreSQL schema initialization.');
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const client = await pool.connect();
    console.log('📡 Connected to Neon PostgreSQL Database successfully!');

    const schemaPath = path.resolve(process.cwd(), 'src/db/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await client.query(sql);
    console.log('✅ All 9 Neon PostgreSQL database tables & constraints initialized successfully!');

    client.release();
    await pool.end();
  } catch (err: any) {
    console.error('❌ Database Initialization Error:', err.message);
  }
}

// Execute if called directly from CLI
if (process.argv[1] && (process.argv[1].endsWith('init-db.ts') || process.argv[1].endsWith('init-db.js'))) {
  initializeDatabase();
}
