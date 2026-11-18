import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../lib/api.js'
import { useCart } from '../context/CartContext.jsx'
import { formatRupiah } from '../lib/format.js'

const QR_BASE = 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=0&data='

function useCountdown(seconds) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) return
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [left])
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return { label: `${mm}:${ss}`, expired: left <= 0 }
}

export default function Payment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const { label, expired } = useCountdown(300)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await api.get(`/orders/${id}`)
        const o = res.order ?? res
        if (!active) return
        if (o.status === 'paid') {
          navigate(`/pesanan/${id}`, { replace: true })
          return
        }
        setOrder(o)
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
  }, [id, navigate])

  async function pay() {
    setPaying(true)
    setError('')
    try {
      await api.post(`/orders/${id}/pay`)
      clearCart()
      navigate(`/pesanan/${id}`)
    } catch (err) {
      setError(err.message)
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p className="muted" style={{ padding: '60px 0', textAlign: 'center' }}>
          Memuat pembayaran…
        </p>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="container">
        <div className="empty-state card">
          <h3>Pesanan tidak ditemukan</h3>
          <p className="muted">{error}</p>
          <Link to="/" className="btn btn-primary">Kembali ke menu</Link>
        </div>
      </div>
    )
  }

  const total = order.total

  return (
    <div className="container">
      <div className="section-head"><h2>Pembayaran</h2></div>
      <div className="pay-wrap">
        <motion.div
          className="qris-slip"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="qris-bar">
            <span className="qris-wordmark">QRIS</span>
            <span className="qris-sub">Pembayaran Standar Nasional</span>
          </div>

          <div className="qris-merchant">
            <strong>RZ COFFE &amp; EATERY</strong>
            <span className="muted small">NMID: ID1024{String(order.id).slice(0, 6).toUpperCase()}</span>
          </div>

          <div className="qris-frame">
            <img
              src={QR_BASE + encodeURIComponent(order.qris_payload || order.id)}
              alt="QRIS"
              width="260"
              height="260"
            />
          </div>

          <div className="qris-amount">{formatRupiah(total)}</div>
          <p className="muted small" style={{ textAlign: 'center' }}>
            Ref: {order.qris_ref || '-'}
          </p>

          <div className={`timer ${expired ? 'timer-expired' : ''}`}>
            {expired ? 'Waktu habis — ini demo, tetap bisa dibayar' : `Berlaku ${label}`}
          </div>

          <span className="demo-chip">● Mode demo — pembayaran disimulasikan</span>

          {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={pay}
            disabled={paying}
            style={{ marginTop: 16 }}
          >
            {paying ? 'Memproses…' : 'Simulasikan pembayaran berhasil'}
          </button>
          <Link to="/" className="btn btn-block" style={{ marginTop: 10 }}>
            Bayar nanti
          </Link>
        </motion.div>

        <aside className="card pay-summary">
          <h3>Rincian Pesanan</h3>
          <ul className="checkout-items">
            {(order.items || []).map((it) => (
              <li key={it.id}>
                <span>
                  {it.name} <span className="muted">× {it.qty}</span>
                </span>
                <span>{formatRupiah(it.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row" style={{ marginTop: 12 }}>
            <span className="muted">Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="summary-row">
              <span className="muted">Diskon{order.voucher_code ? ` (${order.voucher_code})` : ''}</span>
              <span style={{ color: 'var(--danger)' }}>−{formatRupiah(order.discount)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
