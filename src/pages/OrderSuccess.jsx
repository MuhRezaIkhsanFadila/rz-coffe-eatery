import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../lib/api.js'
import { formatRupiah } from '../lib/format.js'
import {
  statusLabel,
  ORDER_FLOW,
  flowIndex,
  isFinalStatus,
  canCancel,
  isPaidStatus,
} from '../lib/orders.js'

const TITLE = {
  pending: 'Menunggu Pembayaran',
  paid: 'Pembayaran Berhasil',
  processing: 'Pesanan Sedang Diproses',
  ready: 'Pesanan Siap Diambil',
  completed: 'Pesanan Selesai',
  expired: 'Pesanan Kedaluwarsa',
  cancelled: 'Pesanan Dibatalkan',
}

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

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await api.get(`/orders/${id}`)
        if (active) setOrder(res.order ?? res)
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
  }, [id])

  if (loading) {
    return (
      <div className="container">
        <p className="muted" style={{ padding: '60px 0', textAlign: 'center' }}>
          Memuat…
        </p>
      </div>
    )
  }

  if (error || !order) {
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

  const paid = isPaidStatus(order.status)
  const activeIndex = flowIndex(order.status)
  const closed = isFinalStatus(order.status) && !paid

  async function cancelOrder() {
    if (!window.confirm('Batalkan pesanan ini?')) return
    setCancelling(true)
    try {
      const res = await api.post(`/orders/${order.id}/cancel`)
      setOrder(res.order ?? res)
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="container">
      <motion.div
        className="receipt card"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="receipt-head">
          <div className={`receipt-check ${paid ? '' : 'pending'}`}>
            {order.status === 'completed' ? '✓✓' : paid ? '✓' : closed ? '×' : '•'}
          </div>
          <h2>{TITLE[order.status] || 'Pesanan'}</h2>
          <p className="muted">
            Pesanan #{String(order.id).slice(0, 8).toUpperCase()}
          </p>
          <span className={`status-badge ${order.status}`}>
            {statusLabel(order.status)}
          </span>
        </div>

        {activeIndex >= 0 && (
          <ol className="order-track">
            {ORDER_FLOW.map((step, i) => (
              <li
                key={step.key}
                className={`order-track-step ${i < activeIndex ? 'done' : ''} ${i === activeIndex ? 'current' : ''}`}
              >
                <span className="dot" />
                <span className="label">{step.label}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="receipt-meta">
          <div className="receipt-row">
            <span className="muted">Tanggal</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="receipt-row">
            <span className="muted">Pemesan</span>
            <span>{order.customer_name || '-'}</span>
          </div>
          <div className="receipt-row">
            <span className="muted">Metode</span>
            <span>{order.payment_method || 'QRIS'}</span>
          </div>
          {order.qris_ref && (
            <div className="receipt-row">
              <span className="muted">Ref</span>
              <span>{order.qris_ref}</span>
            </div>
          )}
        </div>

        <div className="receipt-items">
          {(order.items || []).map((it) => (
            <div className="receipt-row" key={it.id}>
              <span>
                {it.name} <span className="muted">× {it.qty}</span>
              </span>
              <span>{formatRupiah(it.line_total)}</span>
            </div>
          ))}
        </div>

        <div className="receipt-totals">
          <div className="receipt-row">
            <span className="muted">Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="receipt-row">
              <span className="muted">
                Diskon{order.voucher_code ? ` (${order.voucher_code})` : ''}
              </span>
              <span style={{ color: 'var(--danger)' }}>
                −{formatRupiah(order.discount)}
              </span>
            </div>
          )}
          <div className="receipt-row receipt-total">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="receipt-actions">
          {order.status === 'pending' && (
            <Link to={`/pembayaran/${order.id}`} className="btn btn-primary btn-block">
              Lanjut Bayar
            </Link>
          )}
          {canCancel(order.status) && (
            <button
              type="button"
              className="btn btn-block"
              onClick={cancelOrder}
              disabled={cancelling}
            >
              {cancelling ? 'Membatalkan…' : 'Batalkan Pesanan'}
            </button>
          )}
          <button type="button" className="btn btn-block" onClick={() => window.print()}>
            🖨 Cetak / Simpan PDF
          </button>
          <Link to="/" className="btn btn-block">Lihat Menu</Link>
          <Link to="/akun" className="btn btn-primary btn-block">
            Pesanan Saya
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
