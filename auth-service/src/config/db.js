import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const initDb = async (attempt = 1) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    console.log('PostgreSQL connected and users table is ready')
  } catch (error) {
    if (attempt >= 12) {
      throw error
    }

    console.log(`Waiting for PostgreSQL... retry ${attempt}/12`)
    await sleep(2500)
    return initDb(attempt + 1)
  }
}
