import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { products } from '../data/products.js'

const CartContext = createContext(null)
const STORAGE_KEY = 'zaa_cart'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i) => i && typeof i.productId === 'string' && Number(i.qty) > 0
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore storage errors */
    }
  }, [items])

  function addItem(productId, qty = 1) {
    setItems((prev) => {
      const found = prev.find((i) => i.productId === productId)
      if (found) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [...prev, { productId, qty }]
    })
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function setQty(productId, qty) {
    if (qty < 1) {
      removeItem(productId)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    )
  }

  function clearCart() {
    setItems([])
  }

  const detailedItems = useMemo(() => {
    return items
      .map((i) => {
        const product = products.find((p) => p.id === i.productId)
        if (!product) return null
        return { product, qty: i.qty, lineTotal: product.price * i.qty }
      })
      .filter(Boolean)
  }, [items])

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  )
  const subtotal = useMemo(
    () => detailedItems.reduce((sum, i) => sum + i.lineTotal, 0),
    [detailedItems]
  )

  const value = {
    items,
    addItem,
    removeItem,
    setQty,
    clearCart,
    count,
    subtotal,
    detailedItems,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider')
  return ctx
}
