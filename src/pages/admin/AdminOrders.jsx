import { Fragment, useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { formatRupiah } from '../../lib/format.js'

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'paid', label: 'Lunas' },
  { key: 'expired', label: 'Kedaluwarsa' },
  { key: 'cancelled', label: 'Dibatalkan' },
]
const STATUSES = ['pending', 'paid', 'expired', 'cancelled']

function formatDate(iso) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const q = filter === 'all' ? '' : `?status=${filter}`
      const res = await api.get(`/admin/orders${q}`)
      setOrders(Array.isArray(res) ? res : res.orders || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function changeStatus(o, status) {
    try {
      await api.patch(`/admin/orders/${o.id}`, { status })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 className="admin-h1">Pesanan</h1>
      <div className="chips" style={{ marginBottom: 18 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Memuat…</p>
      ) : orders.length === 0 ? (
        <div className="empty-state card">
          <h3>Tidak ada pesanan</h3>
          <p className="muted">Belum ada pesanan pada filter ini.</p>
        </div>
      ) : (
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pelanggan</th>
                <th>Item</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const itemCount = (o.items || []).reduce((s, i) => s + i.qty, 0)
                const isOpen = open === o.id
                return (
                  <Fragment key={o.id}>
                    <tr
                      className="admin-order-row"
                      onClick={() => setOpen(isOpen ? null : o.id)}
                    >
                      <td>#{String(o.id).slice(0, 8).toUpperCase()}</td>
                      <td>
                        {o.customer_name || '-'}
                        {o.user_email && (
                          <span className="muted small"> · {o.user_email}</span>
                        )}
                      </td>
                      <td>{itemCount}</td>
                      <td>{formatRupiah(o.total)}</td>
                      <td>
                        <span className={`status-badge ${o.status}`}>
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="muted small">{formatDate(o.created_at)}</td>
                    </tr>
                    {isOpen && (
                      <tr key={`${o.id}-d`} className="admin-order-detail">
                        <td colSpan={6}>
                          <div className="admin-order-detail-inner">
                            <ul className="checkout-items">
                              {(o.items || []).map((it) => (
                                <li key={it.id}>
                                  <span>{it.name} <span className="muted">× {it.qty}</span></span>
                                  <span>{formatRupiah(it.line_total)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="admin-order-detail-foot">
                              {o.voucher_code && (
                                <span className="chip-mini">Voucher: {o.voucher_code}</span>
                              )}
                              {o.note && <span className="muted small">Catatan: {o.note}</span>}
                              <label className="admin-status-set">
                                Ubah status:
                                <select
                                  className="select"
                                  value={o.status}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => changeStatus(o, e.target.value)}
                                >
                                  {STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
