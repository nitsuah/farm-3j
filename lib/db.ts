// Neon serverless Postgres client.
// Only active when DATABASE_URL is present in the environment.
// Falls back to null so callers can detect and use localStorage instead.

import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;

// sql is null when DATABASE_URL is not configured — API routes check this
// and return 503 so the client can fall back to localStorage.
export const sql = url ? neon(url) : null;
