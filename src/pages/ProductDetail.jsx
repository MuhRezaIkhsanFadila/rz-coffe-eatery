import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useProducts } from '../context/ProductsContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatRupiah } from '../lib/format.js'
import QuantityStepper from '../components/QuantityStepper.jsx'
import ProductImage from '../components/ProductImage.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const { getProduct, loading } = useProducts()
  const product = getProduct(id)
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [toast, setToast] = useState('')

  if (loading && !product) {
    return (
      <div className="container">
        <p className="muted" style={{ padding: '60px 0', textAlign: 'center' }}>
          Memuat…
        </p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container">
        <div className="empty-state card">
          <h3>Produk tidak ditemukan</h3>
          <p className="muted">Produk yang kamu cari tidak tersedia.</p>
          <Link to="/" className="btn btn-primary">Kembali ke menu</Link>
        </div>
      </div>
    )
  }

  function handleAdd() {
    addItem(product.id, qty)
    setToast(`${qty} × ${product.name} ditambahkan ke keranjang`)
    window.setTimeout(() => setToast(''), 2000)
  }

  return (
    <div className="container">
      <Link to="/" className="crumb">← Kembali ke menu</Link>
      <div className="detail">
        <ProductImage product={product} className="detail-media" />

        <div className="detail-info">
          <span className="product-cat">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="detail-meta">
            <span>★ {Number(product.rating || 0).toFixed(1)}</span>
            {product.tag && <span>· {product.tag}</span>}
          </div>
          <p className="detail-desc">{product.description}</p>
          <div className="detail-price">{formatRupiah(product.price)}</div>

          <div className="detail-actions">
            <QuantityStepper value={qty} onChange={setQty} />
            <button type="button" className="btn btn-primary" onClick={handleAdd}>
              Tambah ke keranjang
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
