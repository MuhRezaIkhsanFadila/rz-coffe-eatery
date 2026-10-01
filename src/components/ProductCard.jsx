import { Link } from 'react-router-dom'
import { formatRupiah } from '../lib/format.js'

export default function ProductCard({ product }) {
  return (
    <Link to={`/produk/${product.id}`} className="product-card card">
      <div className="product-thumb">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement.classList.add('thumb-fallback')
            e.currentTarget.parentElement.dataset.emoji = product.emoji
          }}
        />
        {product.tag && <span className="badge">{product.tag}</span>}
      </div>
      <div className="product-body">
        <span className="product-cat">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-foot">
          <span className="price">{formatRupiah(product.price)}</span>
          <span className="rating">★ {product.rating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  )
}
