import { describe, it, expect } from 'vitest'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const orders = require('../netlify/functions/_lib/orders.cjs')
const voucher = require('../netlify/functions/_lib/voucher.cjs')
const qris = require('../netlify/functions/_lib/qris.cjs')

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('lib/orders — status & total', () => {
  it('mengenali seluruh status siklus hidup', () => {
    expect(orders.ORDER_STATUSES).toEqual(
      expect.arrayContaining([
        'pending',
        'paid',
        'processing',
        'ready',
        'completed',
        'expired',
        'cancelled',
      ])
    )
  })

  it('hanya status lunas yang dihitung sebagai pendapatan', () => {
    expect(orders.isPaid('paid')).toBe(true)
    expect(orders.isPaid('processing')).toBe(true)
    expect(orders.isPaid('completed')).toBe(true)
    expect(orders.isPaid('pending')).toBe(false)
    expect(orders.isPaid('expired')).toBe(false)
    expect(orders.isPaid('cancelled')).toBe(false)
  })

  it('menjumlahkan item dan menghitung total setelah diskon', () => {
    const items = [
      { qty: 2, lineTotal: 22000 },
      { qty: 1, lineTotal: 38000 },
    ]
    const subtotal = orders.sumLineTotals(items)
    expect(subtotal).toBe(60000)
    expect(orders.orderTotal(subtotal, 12000)).toBe(48000)
    expect(orders.countItems(items)).toBe(3)
  })

  it('total tidak pernah negatif walau diskon melebihi subtotal', () => {
    expect(orders.orderTotal(17000, 25000)).toBe(0)
  })

  it('default kedaluwarsa 30 menit dan bisa dioverride env', () => {
    expect(orders.expireMinutes({})).toBe(30)
    expect(orders.expireMinutes({ ORDER_EXPIRE_MINUTES: '15' })).toBe(15)
    expect(orders.expireMinutes({ ORDER_EXPIRE_MINUTES: '0' })).toBe(30)
    expect(orders.expireMinutes({ ORDER_EXPIRE_MINUTES: 'abc' })).toBe(30)
  })
})

describe('lib/orders — export CSV', () => {
  const row = {
    id: 'c4804328-d7c2-4204-9809-778666c727fe',
    customer_name: 'Reza, "RZ"',
    user_email: 'admin@rz.coffe',
    status: 'paid',
    subtotal: 17000,
    discount: 0,
    total: 17000,
    voucher_code: null,
    payment_method: 'QRIS',
    qris_ref: 'RZ123',
    created_at: '2026-11-18T14:55:57.876Z',
    paid_at: '2026-11-18T14:56:10.000Z',
    note: 'tanpa gula',
    items: [{ qty: 1, lineTotal: 17000 }],
  }

  it('mengutip sel yang mengandung koma dan kutip', () => {
    expect(orders.csvEscape('Reza, "RZ"')).toBe('"Reza, ""RZ"""')
  })

  it('menetralkan formula spreadsheet', () => {
    expect(orders.csvEscape('=1+1')).toBe("'=1+1")
    expect(orders.csvEscape('@cmd')).toBe("'@cmd")
  })

  it('menulis header lalu satu baris per pesanan', () => {
    const csv = orders.buildOrdersCsv([row])
    const lines = csv.trim().split('\r\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toBe(orders.CSV_HEADER.join(','))
    expect(lines[1]).toContain('C4804328')
    expect(lines[1]).toContain('Lunas')
    expect(lines[1]).toContain('17000')
  })

  it('tanpa pesanan tetap menghasilkan header', () => {
    expect(orders.buildOrdersCsv([]).trim()).toBe(orders.CSV_HEADER.join(','))
  })
})

describe('lib/voucher — aturan diskon', () => {
  const items = [
    { product: { id: 'es-kopi-susu', category: 'Kopi', price: 22000 }, lineTotal: 44000 },
    { product: { id: 'croissant', category: 'Makanan', price: 25000 }, lineTotal: 25000 },
  ]

  it('persen dibatasi max_discount', () => {
    const v = { type: 'percent', value: 20, max_discount: 5000, min_spend: 0, scope: 'all', active: true }
    expect(voucher.computeDiscount(v, items).discount).toBe(5000)
  })

  it('menolak bila minimum belanja belum terpenuhi', () => {
    const v = { type: 'nominal', value: 5000, min_spend: 100000, scope: 'all', active: true }
    const res = voucher.computeDiscount(v, items)
    expect(res.valid).toBe(false)
    expect(res.discount).toBe(0)
    expect(res.reason).toMatch(/Minimum/i)
  })

  it('scope kategori hanya menghitung item kategori itu', () => {
    const v = {
      type: 'nominal',
      value: 5000,
      min_spend: 0,
      scope: 'category',
      scope_value: 'Kopi',
      active: true,
    }
    expect(voucher.computeDiscount(v, items).eligibleSubtotal).toBe(44000)
  })

  it('menolak voucher kedaluwarsa dan yang kuotanya habis', () => {
    const expired = {
      type: 'nominal',
      value: 5000,
      min_spend: 0,
      scope: 'all',
      active: true,
      expires_at: '2020-01-01T00:00:00Z',
    }
    expect(voucher.computeDiscount(expired, items).valid).toBe(false)
    const full = {
      type: 'nominal',
      value: 5000,
      min_spend: 0,
      scope: 'all',
      active: true,
      usage_limit: 3,
      used_count: 3,
    }
    expect(voucher.computeDiscount(full, items).valid).toBe(false)
  })

  it('nominal tidak pernah melebihi subtotal', () => {
    const v = { type: 'nominal', value: 999999, min_spend: 0, scope: 'all', active: true }
    expect(voucher.computeDiscount(v, items).discount).toBe(69000)
  })
})

describe('lib/qris — payload EMVCo', () => {
  it('tlv menulis panjang dua digit', () => {
    expect(qris.tlv('54', '17000')).toBe('540517000')
  })

  it('CRC16 sesuai standar untuk string uji', () => {
    expect(qris.crc16('123456789')).toBe('29B1')
  })

  it('payload punya header, CRC valid, dan ref unik', () => {
    const payload = qris.buildQris(17000, 'RZ-TEST')
    expect(payload.startsWith('000201')).toBe(true)
    expect(payload).toContain('540517000')
    expect(payload).toContain('6304')
    const body = payload.slice(0, -4)
    expect(qris.crc16(body)).toBe(payload.slice(-4))
    const refs = new Set(Array.from({ length: 50 }, () => qris.makeRef()))
    expect(refs.size).toBe(50)
  })
})

describe('skema database', () => {
  it('constraint status di schema.sql memuat semua status di kode', () => {
    const sql = readFileSync(join(root, 'db', 'schema.sql'), 'utf8')
    const line = sql.split('\n').find((l) => l.includes("check (status in ("));
    expect(line).toBeTruthy()
    for (const status of orders.ORDER_STATUSES) {
      expect(line).toContain(`'${status}'`)
    }
  })
})
