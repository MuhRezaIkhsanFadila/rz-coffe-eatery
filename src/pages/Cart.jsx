import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../context/CartContext.jsx'
import { formatRupiah } from '../lib/format.js'
import QuantityStepper from '../components/QuantityStepper.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ProductImage from '../components/ProductImage.jsx'

export default function Cart() {
  const { detailedItems, subtotal, setQty, removeItem, count } = useCart()

  if (count === 0) {
    return (
      <div className="container">
        <div className="section-head"><h2>Keranjang</h2></div>
        <EmptyState
          title="Keranjang masih kosong"
          message="Yuk pilih kopi atau makanan favoritmu dulu."
          actionLabel="Lihat Menu"
          actionTo="/"
        />
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section-head">
        <h2>Keranjang</h2>
        <span className="muted">{count} item</span>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          <AnimatePresence initial={false}>
            {detailedItems.map(({ product, qty, lineTotal }) => (
              <motion.div
                key={product.id}
                layout
                className="cart-row card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductImage product={product} className="cart-thumb" />
                <div className="cart-row-info">
                  <h3>{product.name}</h3>
                  <p className="muted">{formatRupiah(product.price)} / item</p>
                </div>
                <div className="cart-row-controls">
                  <QuantityStepper
                    value={qty}
                    onChange={(n) => setQty(product.id, n)}
                  />
                  <span className="price">{formatRupiah(lineTotal)}</span>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeItem(product.id)}
                  >
                    Hapus
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <aside className="card cart-summary">
          <h3>Ringkasan</h3>
          <div className="summary-row">
            <span className="muted">Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <p className="summary-note">
            Checkout belum tersedia pada versi demo ini.
          </p>
          <button type="button" className="btn btn-primary btn-block" disabled>
            Lanjut ke pembayaran
          </button>
          <Link to="/" className="btn btn-block" style={{ marginTop: 10 }}>
            Lanjut belanja
          </Link>
        </aside>
      </div>
    </div>
  )
}
