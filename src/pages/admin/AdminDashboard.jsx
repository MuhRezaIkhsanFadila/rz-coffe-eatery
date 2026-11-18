import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api.js'
import { formatRupiah } from '../../lib/format.js'

const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function formatDate(iso) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'medium' })
  } catch {
    return iso
  }
}

function dayKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function buildRevenue7d(orders) {
  const days = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push({ key: dayKey(d), label: DOW[d.getDay()], value: 0 })
  }
  const index = new Map(days.map((d) => [d.key, d]))
  for (const o of orders) {
    if (o.status !== 'paid' || !o.created_at) continue
    const d = new Date(o.created_at)
    const slot = index.get(dayKey(d))
    if (slot) slot.value += Number(o.total) || 0
  }
  return days
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [s, o] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/orders').catch(() => []),
        ])
        if (!active) return
        setStats(s)
        setOrders(Array.isArray(o) ? o : o?.orders || [])
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const revenue = useMemo(() => buildRevenue7d(orders), [orders])
  const maxVal = useMemo(
    () => Math.max(1, ...revenue.map((d) => d.value)),
    [revenue]
  )
  const hasSales = revenue.some((d) => d.value > 0)

  if (loading) return <p className="muted">Memuat dashboard…</p>
  if (error) return <p className="error-text">{error}</p>

  const cards = [
    { label: 'Total Pesanan', value: stats.totalOrders ?? 0 },
    { label: 'Pesanan Lunas', value: stats.paidOrders ?? 0 },
    { label: 'Pendapatan', value: formatRupiah(stats.revenue ?? 0) },
    { label: 'Produk', value: stats.productCount ?? 0 },
    { label: 'Voucher', value: stats.voucherCount ?? 0 },
  ]

  return (
    <div>
      <h1 className="admin-h1">Dashboard</h1>

      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <span className="stat-label">{c.label}</span>
            <span className="stat-value">{c.value}</span>
          </div>
        ))}
      </div>

      <div className="card chart-card">
        <h3>Pendapatan 7 Hari Terakhir</h3>
        {!hasSales ? (
          <p className="muted">Belum ada penjualan.</p>
        ) : (
          <div className="bar-chart">
            {revenue.map((d, i) => (
              <div className="bar-col" key={i}>
                <span className="bar-val">
                  {d.value > 0 ? formatRupiah(d.value) : ''}
                </span>
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(d.value > 0 ? 8 : 2, (d.value / maxVal) * 160)}px`,
                  }}
                  title={formatRupiah(d.value)}
                />
                <span className="bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-cols">
        <div className="card admin-panel">
          <h3>Pesanan Terbaru</h3>
          {(stats.recentOrders || []).length === 0 ? (
            <p className="muted">Belum ada pesanan.</p>
          ) : (
            <ul className="admin-list">
              {stats.recentOrders.map((o, i) => (
                <li key={o.id || i}>
                  <span>
                    <strong>{o.customer_name || 'Tanpa nama'}</strong>
                    <span className="muted small"> · {formatDate(o.created_at)}</span>
                  </span>
                  <span>
                    <span className={`status-badge ${o.status}`}>
                      {o.status?.toUpperCase()}
                    </span>{' '}
                    {formatRupiah(o.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card admin-panel">
          <h3>Produk Terlaris</h3>
          {(stats.topProducts || []).length === 0 ? (
            <p className="muted">Belum ada data penjualan.</p>
          ) : (
            <ul className="admin-list">
              {stats.topProducts.map((p, i) => (
                <li key={p.product_id || p.name || i}>
                  <span>{p.name || p.product_id}</span>
                  <span className="muted">{p.qty ?? p.total_qty ?? 0} terjual</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
