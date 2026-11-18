import { Link } from 'react-router-dom'
import { formatRupiah } from '../lib/format.js'
import ProductImage from './ProductImage.jsx'

export default function ProductCard({ product }) {
  return (
    <Link to={`/produk/${product.id}`} className="product-card card">
      <ProductImage product={product} className="product-thumb">
        {product.tag && <span className="badge">{product.tag}</span>}
      </ProductImage>
      <div className="product-body">
        <span className="product-cat">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-foot">
          <span className="price">{formatRupiah(product.price)}</span>
          <span className="rating">★ {Number(product.rating || 0).toFixed(1)}</span>
        </div>
      </div>
    </Link>
  )
}
