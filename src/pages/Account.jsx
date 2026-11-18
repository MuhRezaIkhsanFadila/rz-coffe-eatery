import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { formatRupiah } from '../lib/format.js'
import { statusLabel, canCancel } from '../lib/orders.js'

function formatDate(iso) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')

  async function handleCancel(order) {
    if (!window.confirm(`Batalkan pesanan #${String(order.id).slice(0, 8).toUpperCase()}?`)) return
    setBusyId(order.id)
    setNotice('')
    try {
      await api.post(`/orders/${order.id}/cancel`)
      const res = await api.get('/orders')
      setOrders(Array.isArray(res) ? res : res.orders || [])
      setNotice('Pesanan dibatalkan.')
    } catch (err) {
      setNotice(err.message)
    } finally {
      setBusyId(null)
    }
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await api.get('/orders')
        if (active) setOrders(Array.isArray(res) ? res : res.orders || [])
      } catch {
        if (active) setOrders([])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="container">
      <div className="section-head"><h2>Akun Saya</h2></div>
      <div className="card account-card">
        <div className="avatar">{(user.name || '?').charAt(0).toUpperCase()}</div>
        <div className="account-row">
          <span className="muted">Nama</span>
          <span>{user.name}</span>
        </div>
        <div className="account-row">
          <span className="muted">Email</span>
          <span>{user.email}</span>
        </div>
        <div className="account-row">
          <span className="muted">Peran</span>
          <span>
            {user.role === 'admin' ? (
              <span className="role-pill">Admin</span>
            ) : (
              'Pengguna'
            )}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <Link to="/" className="btn">Lihat Menu</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="btn">Panel Admin</Link>
          )}
          <button type="button" className="btn" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 32 }}>
        <h2>Riwayat Pesanan</h2>
        <span className="muted">{orders.length} pesanan</span>
      </div>

      {notice && <p className="muted small" style={{ marginBottom: 12 }}>{notice}</p>}

      {loading ? (
        <p className="muted">Memuat pesanan…</p>
      ) : orders.length === 0 ? (
        <div className="empty-state card">
          <h3>Belum ada pesanan</h3>
          <p className="muted">Pesanan kamu akan muncul di sini.</p>
          <Link to="/" className="btn btn-primary">Mulai Pesan</Link>
        </div>
      ) : (
        <div className="order-history">
          {orders.map((o) => {
            const to = o.status === 'pending' ? `/pembayaran/${o.id}` : `/pesanan/${o.id}`
            const itemCount = (o.items || []).reduce((s, i) => s + i.qty, 0)
            const cancellable = canCancel(o.status)
            return (
              <div key={o.id} className="order-card card">
                <Link to={to} className="order-card-main">
                  <strong>#{String(o.id).slice(0, 8).toUpperCase()}</strong>
                  <span className="muted small">{formatDate(o.created_at)}</span>
                  <span className="muted small">
                    {itemCount} item · {o.payment_method || 'QRIS'}
                  </span>
                </Link>
                <div className="order-card-side">
                  <span className={`status-badge ${o.status}`}>
                    {statusLabel(o.status)}
                  </span>
                  <strong>{formatRupiah(o.total)}</strong>
                  {cancellable && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleCancel(o)}
                      disabled={busyId === o.id}
                    >
                      {busyId === o.id ? 'Membatalkan…' : 'Batalkan'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
