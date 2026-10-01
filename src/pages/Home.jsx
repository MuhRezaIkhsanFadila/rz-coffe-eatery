import { useMemo, useState } from 'react'
import { products, categories } from '../data/products.js'
import ProductCard from '../components/ProductCard.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Home() {
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
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    return list
  }, [category, query, sort])

  return (
    <div className="container">
      <section className="hero">
        <h1>Kopi & makanan favoritmu, diantar hangat.</h1>
        <p>
          Selamat datang di Zaa Coffe &amp; eatery. Pesan kopi, makanan, dan
          camilan pilihan langsung dari menu kami.
        </p>
        <a href="#menu" className="btn">Lihat Menu</a>
      </section>

      <div className="section-head" id="menu">
        <h2>Menu Kami</h2>
        <span className="muted">{filtered.length} produk</span>
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

      {filtered.length === 0 ? (
        <EmptyState
          title="Produk tidak ditemukan"
          message="Coba kata kunci atau kategori lain."
        />
      ) : (
        <div className="grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
