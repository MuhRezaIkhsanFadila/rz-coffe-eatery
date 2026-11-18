// RZ COFFE & EATERY — API (Netlify Function, CommonJS)
// Semua endpoint di bawah base path /api/*
const { query } = require('./_lib/db.cjs')
const {
  json,
  noContent,
  hashPassword,
  comparePassword,
  signToken,
  getUser,
} = require('./_lib/auth.cjs')
const { buildQris, makeRef } = require('./_lib/qris.cjs')
const { computeDiscount } = require('./_lib/voucher.cjs')

const ORDER_STATUSES = ['pending', 'paid', 'expired', 'cancelled']

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role }
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

async function itemsForOrders(orderIds) {
  if (!orderIds.length) return {}
  const { rows } = await query(
    `select id, order_id, product_id, name, price, qty, line_total
       from order_items where order_id = any($1::uuid[]) order by name`,
    [orderIds]
  )
  const map = {}
  for (const r of rows) {
    ;(map[r.order_id] = map[r.order_id] || []).push(r)
  }
  return map
}

// Bangun daftar item ter-harga dari DB berdasar [{productId, qty}]
async function pricedItems(rawItems) {
  const ids = [...new Set((rawItems || []).map((i) => i.productId))].filter(
    Boolean
  )
  if (!ids.length) return { items: [], error: 'Keranjang kosong.' }
  const { rows } = await query(
    `select id, name, category, price from products
       where id = any($1) and available = true`,
    [ids]
  )
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]))
  const items = []
  for (const raw of rawItems) {
    const p = byId[raw.productId]
    const qty = Math.max(1, parseInt(raw.qty, 10) || 0)
    if (!p) continue
    items.push({
      product: p,
      productId: p.id,
      name: p.name,
      price: p.price,
      qty,
      lineTotal: p.price * qty,
    })
  }
  if (!items.length) return { items: [], error: 'Produk tidak ditemukan.' }
  return { items }
}

exports.handler = async (event) => {
  const method = event.httpMethod
  if (method === 'OPTIONS') return noContent()

  // Normalisasi path -> '/auth/login', '/products', dst.
  let path = event.path || '/'
  path = path.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '')
  if (!path.startsWith('/')) path = '/' + path
  const seg = path.split('/').filter(Boolean)
  const body = (() => {
    try {
      return JSON.parse(event.body || '{}')
    } catch {
      return {}
    }
  })()
  const qs = event.queryStringParameters || {}

  try {
    // ---------------- AUTH ----------------
    if (seg[0] === 'auth') {
      // POST /auth/register
      if (method === 'POST' && seg[1] === 'register') {
        const name = (body.name || '').trim()
        const email = (body.email || '').trim().toLowerCase()
        const password = body.password || ''
        if (!name) return json(400, { error: 'Nama wajib diisi.' })
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          return json(400, { error: 'Email tidak valid.' })
        if (password.length < 6)
          return json(400, { error: 'Password minimal 6 karakter.' })
        const exists = await query('select 1 from users where email=$1', [email])
        if (exists.rowCount)
          return json(409, { error: 'Email sudah terdaftar.' })
        const hash = await hashPassword(password)
        const { rows } = await query(
          `insert into users (name,email,password_hash,role)
           values ($1,$2,$3,'user')
           returning id,name,email,role`,
          [name, email, hash]
        )
        const user = rows[0]
        return json(201, { token: signToken(user), user: publicUser(user) })
      }

      // POST /auth/login  dan  POST /auth/admin/login
      const isAdminLogin = seg[1] === 'admin' && seg[2] === 'login'
      if (method === 'POST' && (seg[1] === 'login' || isAdminLogin)) {
        const email = (body.email || '').trim().toLowerCase()
        const password = body.password || ''
        const { rows } = await query(
          'select id,name,email,role,password_hash from users where email=$1',
          [email]
        )
        const row = rows[0]
        if (!row || !(await comparePassword(password, row.password_hash)))
          return json(401, { error: 'Email atau password salah.' })
        if (isAdminLogin && row.role !== 'admin')
          return json(403, { error: 'Akun ini bukan admin.' })
        if (!isAdminLogin && row.role !== 'user')
          return json(403, {
            error: 'Akun ini admin. Silakan masuk lewat halaman admin.',
          })
        return json(200, { token: signToken(row), user: publicUser(row) })
      }

      // GET /auth/me
      if (method === 'GET' && seg[1] === 'me') {
        const auth = getUser(event)
        if (!auth) return json(401, { error: 'Belum login.' })
        const { rows } = await query(
          'select id,name,email,role from users where id=$1',
          [auth.id]
        )
        if (!rows[0]) return json(401, { error: 'Sesi tidak valid.' })
        return json(200, { user: publicUser(rows[0]) })
      }
    }

    // ---------------- PRODUCTS (public) ----------------
    if (seg[0] === 'products' && seg.length === 1 && method === 'GET') {
      const { rows } = await query(
        `select id,name,category,price,image,emoji,description,rating,tag,sort,available
           from products where available = true
           order by sort asc nulls last, name asc`
      )
      return json(200, rows)
    }

    // ---------------- VOUCHERS (public validate) ----------------
    if (
      seg[0] === 'vouchers' &&
      seg[1] === 'validate' &&
      method === 'POST'
    ) {
      const code = (body.code || '').trim().toUpperCase()
      if (!code) return json(400, { valid: false, error: 'Kode voucher kosong.' })
      const { rows } = await query(
        'select * from vouchers where upper(code)=$1',
        [code]
      )
      const voucher = rows[0]
      if (!voucher)
        return json(200, { valid: false, error: 'Kode voucher tidak ditemukan.' })
      const { items, error } = await pricedItems(body.items)
      if (error) return json(400, { valid: false, error })
      const res = computeDiscount(voucher, items)
      const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
      if (!res.valid)
        return json(200, { valid: false, error: res.reason })
      return json(200, {
        valid: true,
        discount: res.discount,
        subtotal,
        total: subtotal - res.discount,
        voucher: {
          code: voucher.code,
          description: voucher.description,
          type: voucher.type,
          value: voucher.value,
        },
      })
    }

    // ---------------- ORDERS (auth) ----------------
    if (seg[0] === 'orders') {
      const auth = getUser(event)
      if (!auth) return json(401, { error: 'Silakan login dulu.' })

      // POST /orders
      if (method === 'POST' && seg.length === 1) {
        const { items, error } = await pricedItems(body.items)
        if (error) return json(400, { error })
        const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)

        let discount = 0
        let voucherCode = null
        if (body.voucherCode) {
          const code = String(body.voucherCode).trim().toUpperCase()
          const { rows } = await query(
            'select * from vouchers where upper(code)=$1',
            [code]
          )
          const voucher = rows[0]
          if (!voucher) return json(400, { error: 'Kode voucher tidak ditemukan.' })
          const res = computeDiscount(voucher, items)
          if (!res.valid) return json(400, { error: res.reason })
          discount = res.discount
          voucherCode = voucher.code
        }

        const total = Math.max(0, subtotal - discount)
        const ref = makeRef()
        const qris = buildQris(total, ref)
        const customerName = (body.customerName || '').trim() || null
        const note = (body.note || '').trim() || null

        const { rows: orows } = await query(
          `insert into orders
             (user_id,status,subtotal,discount,total,payment_method,
              qris_payload,qris_ref,voucher_code,customer_name,note)
           values ($1,'pending',$2,$3,$4,'QRIS',$5,$6,$7,$8,$9)
           returning *`,
          [
            auth.id,
            subtotal,
            discount,
            total,
            qris,
            ref,
            voucherCode,
            customerName,
            note,
          ]
        )
        const order = orows[0]

        // insert items
        const values = []
        const params = []
        let idx = 1
        for (const it of items) {
          values.push(
            `($${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++})`
          )
          params.push(order.id, it.productId, it.name, it.price, it.qty, it.lineTotal)
        }
        await query(
          `insert into order_items (order_id,product_id,name,price,qty,line_total)
             values ${values.join(',')}`,
          params
        )
        const map = await itemsForOrders([order.id])
        order.items = map[order.id] || []
        return json(201, { order })
      }

      // GET /orders  (riwayat milik user)
      if (method === 'GET' && seg.length === 1) {
        const { rows } = await query(
          'select * from orders where user_id=$1 order by created_at desc',
          [auth.id]
        )
        const map = await itemsForOrders(rows.map((r) => r.id))
        for (const o of rows) o.items = map[o.id] || []
        return json(200, rows)
      }

      // GET /orders/:id
      if (method === 'GET' && seg.length === 2) {
        const { rows } = await query('select * from orders where id=$1', [seg[1]])
        const order = rows[0]
        if (!order) return json(404, { error: 'Pesanan tidak ditemukan.' })
        if (order.user_id !== auth.id && auth.role !== 'admin')
          return json(404, { error: 'Pesanan tidak ditemukan.' })
        const map = await itemsForOrders([order.id])
        order.items = map[order.id] || []
        return json(200, { order })
      }

      // POST /orders/:id/pay  (demo pembayaran)
      if (method === 'POST' && seg.length === 3 && seg[2] === 'pay') {
        const { rows } = await query('select * from orders where id=$1', [seg[1]])
        const order = rows[0]
        if (!order || (order.user_id !== auth.id && auth.role !== 'admin'))
          return json(404, { error: 'Pesanan tidak ditemukan.' })
        if (order.status !== 'pending') {
          const map = await itemsForOrders([order.id])
          order.items = map[order.id] || []
          return json(200, { order })
        }
        const { rows: urows } = await query(
          `update orders set status='paid', paid_at=now() where id=$1 returning *`,
          [order.id]
        )
        const paid = urows[0]
        if (paid.voucher_code) {
          await query(
            'update vouchers set used_count = used_count + 1 where upper(code)=upper($1)',
            [paid.voucher_code]
          )
        }
        const map = await itemsForOrders([paid.id])
        paid.items = map[paid.id] || []
        return json(200, { order: paid })
      }
    }

    // ---------------- ADMIN (auth + role admin) ----------------
    if (seg[0] === 'admin') {
      const auth = getUser(event)
      if (!auth) return json(401, { error: 'Silakan login dulu.' })
      if (auth.role !== 'admin')
        return json(403, { error: 'Akses admin diperlukan.' })

      // GET /admin/stats
      if (method === 'GET' && seg[1] === 'stats') {
        const [tot, paid, prod, vou, recent, top] = await Promise.all([
          query('select count(*)::int n from orders'),
          query(
            "select count(*)::int n, coalesce(sum(total),0)::int rev from orders where status='paid'"
          ),
          query('select count(*)::int n from products'),
          query('select count(*)::int n from vouchers'),
          query(
            'select id,customer_name,total,status,created_at from orders order by created_at desc limit 5'
          ),
          query(
            `select oi.product_id, oi.name, sum(oi.qty)::int qty_sold
               from order_items oi join orders o on o.id=oi.order_id
               where o.status='paid'
               group by oi.product_id, oi.name
               order by qty_sold desc limit 5`
          ),
        ])
        return json(200, {
          totalOrders: tot.rows[0].n,
          paidOrders: paid.rows[0].n,
          revenue: paid.rows[0].rev,
          productCount: prod.rows[0].n,
          voucherCount: vou.rows[0].n,
          recentOrders: recent.rows,
          topProducts: top.rows,
        })
      }

      // -------- PRODUCTS admin --------
      if (seg[1] === 'products') {
        if (method === 'GET' && seg.length === 2) {
          const { rows } = await query(
            'select * from products order by sort asc nulls last, name asc'
          )
          return json(200, rows)
        }
        if (method === 'POST' && seg.length === 2) {
          const name = (body.name || '').trim()
          const category = (body.category || '').trim()
          const price = parseInt(body.price, 10)
          if (!name || !category || !(price >= 0))
            return json(400, { error: 'Nama, kategori, dan harga wajib diisi.' })
          let id = (body.id && slugify(body.id)) || slugify(name)
          if (!id) id = 'produk'
          // pastikan unik
          let unique = id
          let n = 1
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const ex = await query('select 1 from products where id=$1', [unique])
            if (!ex.rowCount) break
            unique = `${id}-${++n}`
          }
          const { rows } = await query(
            `insert into products
               (id,name,category,price,image,emoji,description,rating,tag,sort,available)
             values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             returning *`,
            [
              unique,
              name,
              category,
              price,
              body.image || null,
              body.emoji || null,
              body.description || null,
              body.rating != null ? body.rating : 4.5,
              body.tag || null,
              body.sort != null ? parseInt(body.sort, 10) : 0,
              body.available != null ? !!body.available : true,
            ]
          )
          return json(201, { product: rows[0] })
        }
        if (method === 'PATCH' && seg.length === 3) {
          const allowed = [
            'name',
            'category',
            'price',
            'image',
            'emoji',
            'description',
            'rating',
            'tag',
            'sort',
            'available',
          ]
          const sets = []
          const params = []
          let i = 1
          for (const k of allowed) {
            if (k in body) {
              sets.push(`${k}=$${i++}`)
              params.push(body[k])
            }
          }
          if (!sets.length) return json(400, { error: 'Tidak ada perubahan.' })
          params.push(seg[2])
          const { rows } = await query(
            `update products set ${sets.join(',')} where id=$${i} returning *`,
            params
          )
          if (!rows[0]) return json(404, { error: 'Produk tidak ditemukan.' })
          return json(200, { product: rows[0] })
        }
        if (method === 'DELETE' && seg.length === 3) {
          await query('delete from products where id=$1', [seg[2]])
          return json(200, { ok: true })
        }
      }

      // -------- ORDERS admin --------
      if (seg[1] === 'orders') {
        if (method === 'GET' && seg.length === 2) {
          const status = qs.status
          const where =
            status && ORDER_STATUSES.includes(status) ? 'where o.status=$1' : ''
          const params = where ? [status] : []
          const { rows } = await query(
            `select o.*, u.email as user_email, u.name as user_name
               from orders o left join users u on u.id=o.user_id
               ${where}
               order by o.created_at desc`,
            params
          )
          const map = await itemsForOrders(rows.map((r) => r.id))
          for (const o of rows) o.items = map[o.id] || []
          return json(200, rows)
        }
        if (method === 'PATCH' && seg.length === 3) {
          const status = body.status
          if (!ORDER_STATUSES.includes(status))
            return json(400, { error: 'Status tidak valid.' })
          const paidAt = status === 'paid' ? ', paid_at=now()' : ''
          const { rows } = await query(
            `update orders set status=$1 ${paidAt} where id=$2 returning *`,
            [status, seg[2]]
          )
          if (!rows[0]) return json(404, { error: 'Pesanan tidak ditemukan.' })
          return json(200, { order: rows[0] })
        }
      }

      // -------- VOUCHERS admin --------
      if (seg[1] === 'vouchers') {
        if (method === 'GET' && seg.length === 2) {
          const { rows } = await query(
            'select * from vouchers order by created_at desc'
          )
          return json(200, rows)
        }
        if (method === 'POST' && seg.length === 2) {
          const code = (body.code || '').trim().toUpperCase()
          const type = body.type
          const value = parseInt(body.value, 10)
          if (!code) return json(400, { error: 'Kode voucher wajib diisi.' })
          if (!['percent', 'amount'].includes(type))
            return json(400, { error: 'Tipe voucher tidak valid.' })
          if (!(value > 0)) return json(400, { error: 'Nilai voucher tidak valid.' })
          const scope = ['all', 'category', 'product'].includes(body.scope)
            ? body.scope
            : 'all'
          const ex = await query('select 1 from vouchers where upper(code)=$1', [
            code,
          ])
          if (ex.rowCount) return json(409, { error: 'Kode voucher sudah ada.' })
          const { rows } = await query(
            `insert into vouchers
               (code,description,type,value,scope,scope_value,min_spend,
                max_discount,active,starts_at,expires_at,usage_limit)
             values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
             returning *`,
            [
              code,
              body.description || null,
              type,
              value,
              scope,
              scope === 'all' ? null : body.scopeValue || null,
              body.minSpend != null ? parseInt(body.minSpend, 10) : 0,
              body.maxDiscount != null && body.maxDiscount !== ''
                ? parseInt(body.maxDiscount, 10)
                : null,
              body.active != null ? !!body.active : true,
              body.startsAt || null,
              body.expiresAt || null,
              body.usageLimit != null && body.usageLimit !== ''
                ? parseInt(body.usageLimit, 10)
                : null,
            ]
          )
          return json(201, { voucher: rows[0] })
        }
        if (method === 'PATCH' && seg.length === 3) {
          const map = {
            description: 'description',
            type: 'type',
            value: 'value',
            scope: 'scope',
            scopeValue: 'scope_value',
            minSpend: 'min_spend',
            maxDiscount: 'max_discount',
            active: 'active',
            startsAt: 'starts_at',
            expiresAt: 'expires_at',
            usageLimit: 'usage_limit',
          }
          const sets = []
          const params = []
          let i = 1
          for (const key of Object.keys(map)) {
            if (key in body) {
              sets.push(`${map[key]}=$${i++}`)
              params.push(body[key] === '' ? null : body[key])
            }
          }
          if (!sets.length) return json(400, { error: 'Tidak ada perubahan.' })
          params.push(seg[2])
          const { rows } = await query(
            `update vouchers set ${sets.join(',')} where id=$${i} returning *`,
            params
          )
          if (!rows[0]) return json(404, { error: 'Voucher tidak ditemukan.' })
          return json(200, { voucher: rows[0] })
        }
        if (method === 'DELETE' && seg.length === 3) {
          await query('delete from vouchers where id=$1', [seg[2]])
          return json(200, { ok: true })
        }
      }
    }

    return json(404, { error: 'Endpoint tidak ditemukan: ' + method + ' ' + path })
  } catch (err) {
    return json(500, { error: err.message || 'Server error' })
  }
}
