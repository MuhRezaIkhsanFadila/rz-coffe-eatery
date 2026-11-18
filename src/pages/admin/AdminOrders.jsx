import { Fragment, useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { formatRupiah } from '../../lib/format.js'
import { STATUS_LABEL, statusLabel } from '../../lib/orders.js'

const BASE = import.meta.env.VITE_API_URL || '/api'

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'paid', label: 'Lunas' },
  { key: 'processing', label: 'Diproses' },
  { key: 'ready', label: 'Siap' },
  { key: 'completed', label: 'Selesai' },
  { key: 'expired', label: 'Kedaluwarsa' },
  { key: 'cancelled', label: 'Dibatalkan' },
]
const STATUSES = Object.keys(STATUS_LABEL)

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
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [exporting, setExporting] = useState(false)

  async function exportCsv() {
    setExporting(true)
    setError('')
    try {
      const qs = new URLSearchParams()
      if (from) qs.set('from', from)
      if (to) qs.set('to', to)
      const res = await fetch(`${BASE}/admin/orders/export?${qs}`, {
        headers: { Authorization: `Bearer ${api.getToken()}` },
      })
      if (!res.ok) throw new Error('Gagal mengunduh laporan.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pesanan-rz-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setExporting(false)
    }
  }

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
      <div className="card export-bar">
        <div className="export-fields">
          <label>
            <span className="muted small">Dari</span>
            <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            <span className="muted small">Sampai</span>
            <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
        <button type="button" className="btn btn-primary" onClick={exportCsv} disabled={exporting}>
          {exporting ? 'Menyiapkan…' : '⬇ Unduh Laporan CSV'}
        </button>
      </div>
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
                          {statusLabel(o.status)}
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
                                    <option key={s} value={s}>{statusLabel(s)}</option>
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
