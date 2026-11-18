// Inisialisasi database Railway: jalankan db/schema.sql (buat tabel + seed produk).
// Pakai: `npm run db:init`  (butuh DATABASE_URL di .env / .env.local / environment)
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Loader .env sederhana tanpa dependency.
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const raw = readFileSync(join(__dirname, '..', file), 'utf8')
      for (const line of raw.split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
        if (!m) continue
        const key = m[1]
        let val = m[2].replace(/^["']|["']$/g, '')
        if (!(key in process.env)) process.env[key] = val
      }
    } catch {
      /* file tidak ada, lewati */
    }
  }
}

loadEnv()

const url = process.env.DATABASE_URL
if (!url) {
  console.error('❌  DATABASE_URL belum di-set. Isi di .env / .env.local dulu.')
  process.exit(1)
}

const ssl =
  process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }

const client = new pg.Client({ connectionString: url, ssl })
const sql = readFileSync(join(__dirname, '..', 'db', 'schema.sql'), 'utf8')

try {
  await client.connect()
  console.log('🔌  Terhubung ke database…')
  await client.query(sql)
  const { rows } = await client.query('select count(*)::int as n from products')
  console.log(`✅  Schema siap. Produk di database: ${rows[0].n}`)
} catch (err) {
  console.error('❌  Gagal inisialisasi:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
