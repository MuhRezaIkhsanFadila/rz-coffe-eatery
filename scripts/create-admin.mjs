// Buat / promote user jadi ADMIN.
// Pakai:
//   npm run admin:create -- admin@rz.coffe passwordku "Admin RZ"
// atau set env ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME lalu: npm run admin:create
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const raw = readFileSync(join(__dirname, '..', file), 'utf8')
      for (const line of raw.split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
        if (!m) continue
        const key = m[1]
        const val = m[2].replace(/^["']|["']$/g, '')
        if (!(key in process.env)) process.env[key] = val
      }
    } catch {
      /* file tidak ada, lewati */
    }
  }
}

loadEnv()

const args = process.argv.slice(2)
const email = (args[0] || process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const password = args[1] || process.env.ADMIN_PASSWORD || ''
const name = args[2] || process.env.ADMIN_NAME || 'Admin'

if (!email || !password) {
  console.error('Pakai: npm run admin:create -- <email> <password> [nama]')
  console.error('   atau set ADMIN_EMAIL & ADMIN_PASSWORD di .env.local')
  process.exit(1)
}
if (password.length < 6) {
  console.error('❌  Password minimal 6 karakter.')
  process.exit(1)
}
if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL belum di-set di .env / .env.local.')
  process.exit(1)
}

const ssl =
  process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl,
})

try {
  await client.connect()
  const hash = await bcrypt.hash(password, 10)
  await client.query(
    `insert into users (name, email, password_hash, role)
     values ($1, $2, $3, 'admin')
     on conflict (email) do update
       set password_hash = excluded.password_hash,
           role = 'admin',
           name = excluded.name`,
    [name, email, hash]
  )
  console.log(`✅  Admin siap: ${email}  (role=admin)`) 
  console.log('   Login lewat halaman /admin/login')
} catch (err) {
  console.error('❌  Gagal membuat admin:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
