import { useMemo, useState } from 'react'
import { useProducts } from '../context/ProductsContext.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Home() {
  const { products, categories, loading } = useProducts()
  const [category, setCategory] = useState('Semua')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('default')

  const filtered = useMemo(() => {
    let list = products
    if (category !== 'Semua') list = list.filter((p) => p.category === category)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (sort === 'cheap') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'expensive') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'rating')
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return list
  }, [products, category, query, sort])

  const bestSellers = useMemo(
    () => products.filter((p) => p.tag === 'Favorit'),
    [products]
  )

  return (
    <div className="container">
      <section className="hero">
        <h1>Kopi &amp; makanan favoritmu, diantar hangat.</h1>
        <p>
          Selamat datang di RZ COFFE &amp; EATERY. Pesan kopi, makanan, dan
          camilan pilihan langsung dari menu kami.
        </p>
        <a href="#menu" className="btn">Lihat Menu</a>
      </section>

      <section className="promo">
        <div>
          <h2>Diskon 20% untuk pembelian pertama</h2>
          <p>Pakai kode <strong>RZ20</strong> saat checkout menu favoritmu.</p>
        </div>
        <a href="#menu" className="btn">Pesan Sekarang</a>
      </section>

      {bestSellers.length > 0 && (
        <>
          <div className="section-head">
            <h2>Best Seller</h2>
            <a href="#menu" className="link-more">Lihat semua →</a>
          </div>
          <ProductGrid products={bestSellers} />
        </>
      )}

      <div className="section-head" id="menu">
        <h2>Menu Kami</h2>
        <span className="muted">
          {loading ? 'Memuat…' : `${filtered.length} produk`}
        </span>
      </div>

      <div className="filters">
        <div className="chips">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="filters-right">
          <input
            type="search"
            className="search-input"
            placeholder="Cari produk…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">Urutkan</option>
            <option value="cheap">Termurah</option>
            <option value="expensive">Termahal</option>
            <option value="rating">Rating tertinggi</option>
          </select>
        </div>
      </div>

      {loading && products.length === 0 ? (
        <p className="muted">Memuat menu…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Produk tidak ditemukan"
          message="Coba kata kunci atau kategori lain."
        />
      ) : (
        <ProductGrid products={filtered} />
      )}

      <section className="info-strip">
        <div className="info-card card">
          <span className="info-icon">🕘</span>
          <h3>Jam Buka</h3>
          <p className="muted">Setiap hari, 08.00 – 22.00 WIB</p>
        </div>
        <div className="info-card card">
          <span className="info-icon">📍</span>
          <h3>Lokasi</h3>
          <p className="muted">Jl. Kopi Nikmat No. 12, Jakarta</p>
        </div>
        <div className="info-card card">
          <span className="info-icon">📞</span>
          <h3>Kontak</h3>
          <p className="muted">0812-3456-7890 · halo@rz.coffe</p>
        </div>
      </section>
    </div>
  )
}
