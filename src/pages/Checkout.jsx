import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { formatRupiah } from '../lib/format.js'

export default function Checkout() {
  const { detailedItems, subtotal, count } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [customerName, setCustomerName] = useState(user?.name || '')
  const [note, setNote] = useState('')
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState(null)
  const [voucherError, setVoucherError] = useState('')
  const [checking, setChecking] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (count === 0) navigate('/', { replace: true })
  }, [count, navigate])

  const items = detailedItems.map((d) => ({ productId: d.product.id, qty: d.qty }))
  const discount = applied?.discount || 0
  const total = Math.max(0, subtotal - discount)

  async function applyVoucher(e) {
    e.preventDefault()
    setVoucherError('')
    if (!code.trim()) return
    setChecking(true)
    try {
      const res = await api.post(
        '/vouchers/validate',
        { code: code.trim(), items },
        false
      )
      if (res.valid) {
        setApplied({ code: res.voucher.code, discount: res.discount, info: res.voucher })
        setVoucherError('')
      } else {
        setApplied(null)
        setVoucherError(res.error || 'Voucher tidak berlaku.')
      }
    } catch (err) {
      setApplied(null)
      setVoucherError(err.message)
    } finally {
      setChecking(false)
    }
  }

  function removeVoucher() {
    setApplied(null)
    setCode('')
    setVoucherError('')
  }

  async function placeOrder() {
    setError('')
    if (!customerName.trim()) {
      setError('Nama pemesan wajib diisi.')
      return
    }
    setPlacing(true)
    try {
      const res = await api.post('/orders', {
        items,
        customerName: customerName.trim(),
        note: note.trim(),
        voucherCode: applied?.code,
      })
      const order = res.order ?? res
      navigate(`/pembayaran/${order.id}`)
    } catch (err) {
      setError(err.message)
      setPlacing(false)
    }
  }

  if (count === 0) return null

  return (
    <div className="container">
      <Link to="/keranjang" className="crumb">← Kembali ke keranjang</Link>
      <div className="section-head"><h2>Checkout</h2></div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="card checkout-card">
            <h3>Data Pemesan</h3>
            <div className="field">
              <label htmlFor="cname">Nama</label>
              <input
                id="cname"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama pemesan"
              />
            </div>
            <div className="field">
              <label htmlFor="note">Catatan (opsional)</label>
              <input
                id="note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: es sedikit, tanpa gula"
              />
            </div>
          </div>

          <div className="card checkout-card">
            <h3>Voucher</h3>
            {applied ? (
              <div className="voucher-applied">
                <div>
                  <strong>{applied.code}</strong>
                  <p className="muted">
                    Potongan {formatRupiah(applied.discount)}
                  </p>
                </div>
                <button type="button" className="remove-btn" onClick={removeVoucher}>
                  Hapus
                </button>
              </div>
            ) : (
              <form className="voucher-row" onSubmit={applyVoucher}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Masukkan kode voucher"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
                <button type="submit" className="btn" disabled={checking}>
                  {checking ? 'Cek…' : 'Pakai'}
                </button>
              </form>
            )}
            {voucherError && <p className="error-text">{voucherError}</p>}
          </div>

          <div className="card checkout-card">
            <h3>Item</h3>
            <ul className="checkout-items">
              {detailedItems.map(({ product, qty, lineTotal }) => (
                <li key={product.id}>
                  <span>
                    {product.name} <span className="muted">× {qty}</span>
                  </span>
                  <span>{formatRupiah(lineTotal)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="card cart-summary checkout-summary">
          <h3>Ringkasan</h3>
          <div className="summary-row">
            <span className="muted">Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row">
              <span className="muted">Diskon ({applied.code})</span>
              <span style={{ color: 'var(--danger)' }}>
                −{formatRupiah(discount)}
              </span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={placeOrder}
            disabled={placing}
          >
            {placing ? 'Memproses…' : 'Buat Pesanan & Bayar QRIS'}
          </button>
        </aside>
      </div>
    </div>
  )
}
