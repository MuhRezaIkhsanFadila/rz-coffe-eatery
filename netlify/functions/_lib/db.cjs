// Koneksi PostgreSQL (Railway) — pooled, singleton per container.
const { Pool } = require('pg')

let pool = null

function getPool() {
  if (pool) return pool
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL belum di-set. Tambahkan di environment variable Netlify (public URL Railway).'
    )
  }
  const ssl =
    process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
  pool = new Pool({ connectionString, ssl, max: 3 })
  return pool
}

async function query(text, params) {
  return getPool().query(text, params)
}

module.exports = { query, getPool }
