import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { products as localProducts } from '../data/products.js'

const ProductsContext = createContext(null)
const ORDER = ['Kopi', 'Non-Kopi', 'Makanan', 'Snack']

function buildCategories(list) {
  const present = new Set(list.map((p) => p.category))
  const ordered = ORDER.filter((c) => present.has(c))
  const extras = [...present].filter((c) => !ORDER.includes(c))
  return ['Semua', ...ordered, ...extras]
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await api.get('/products', false)
        if (!active) return
        if (Array.isArray(res) && res.length) setProducts(res)
        else setProducts(localProducts)
      } catch {
        if (active) setProducts(localProducts)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => buildCategories(products), [products])

  function getProduct(id) {
    return products.find((p) => p.id === id) || null
  }

  return (
    <ProductsContext.Provider
      value={{ products, categories, loading, getProduct }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts harus dipakai di dalam ProductsProvider')
  return ctx
}
