# Zaa Coffe & eatery — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bangun SPA e-commerce frontend-only (katalog, detail produk, keranjang, login/akun simulasi) untuk toko kopi & makanan "Zaa Coffe & eatery" dengan React + Vite dan tampilan modern minimal.

**Architecture:** SPA React tanpa backend. State global lewat dua Context (`CartContext`, `AuthContext`) yang mempersist ke `localStorage`. Routing dengan React Router. Styling dengan CSS biasa (variabel tema di `src/index.css` + CSS per halaman).

**Tech Stack:** React 18, Vite 5, react-router-dom 6, CSS biasa. Tanpa backend, tanpa database, tanpa test framework (verifikasi lewat build + browser).

## Global Constraints

- Nama toko ditulis persis: **Zaa Coffe & eatery** (ejaan "Coffe" disengaja).
- Bahasa antarmuka: Indonesia.
- Warna aksen: `#6F4E37` (cokelat kopi); latar `#FAFAF8`.
- Nilai `localStorage` key: `zaa_cart`, `zaa_user`, `zaa_users`.
- Kategori produk persis: `Kopi`, `Non-Kopi`, `Makanan`, `Snack`.
- Tanpa checkout, pembayaran, wishlist, backend.
- React + Vite, JSX, `type: module`.
- Tidak menambah dependensi di luar: `react`, `react-dom`, `react-router-dom`, `@vitejs/plugin-react`, `vite`.
- Password di `localStorage` disimpan sebagai string polos (simulasi, bukan untuk produksi).

## File Structure

- `index.html` — shell HTML.
- `package.json`, `vite.config.js` — setup Vite.
- `src/main.jsx` — entry; mount provider + router.
- `src/App.jsx` — definisi route + layout Navbar/Footer.
- `src/index.css` — reset, variabel tema, utilitas global.
- `src/data/products.js` — 16 produk dummy.
- `src/lib/format.js` — helper format rupiah.
- `src/context/CartContext.jsx` — state keranjang + persist.
- `src/context/AuthContext.jsx` — login/daftar/logout + persist.
- `src/components/Navbar.jsx`, `Footer.jsx`, `ProductCard.jsx`, `QuantityStepper.jsx`, `ProtectedRoute.jsx`, `EmptyState.jsx`.
- `src/pages/Home.jsx`, `ProductDetail.jsx`, `Cart.jsx`, `Login.jsx`, `Register.jsx`, `Account.jsx`, `NotFound.jsx`.
- `src/pages/pages.css` — gaya bersama halaman; komponen pakai `src/index.css` + `src/components/components.css`.

---

### Task 1: Scaffold proyek Vite + React + Router

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/index.css`, `.gitignore`

**Interfaces:**
- Produces: proyek dapat `npm install` dan `npm run dev`; `src/index.css` menyediakan variabel `--brand`, `--surface`, `--text`, `--muted`, `--border`, `--radius`, `--shadow`; kelas global `.btn`, `.btn-primary`, `.card`, `.container`.

- [ ] **Step 1: Init git & buat package.json**

Buat `package.json`:

```json
{
  "name": "zaa-coffe-eatery",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.8"
  }
}
```

- [ ] **Step 2: Buat vite.config.js, index.html, .gitignore**

`vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ plugins: [react()] })
```

`index.html`:

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zaa Coffe & eatery</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`.gitignore`:

```
node_modules
dist
.DS_Store
*.local
```

- [ ] **Step 3: Buat src/index.css (tema + utilitas global)**

```css
:root {
  --bg: #FAFAF8;
  --surface: #FFFFFF;
  --text: #1A1A1A;
  --muted: #6B6B6B;
  --brand: #6F4E37;
  --brand-dark: #5A3E2B;
  --brand-soft: #C8A27A;
  --border: #E8E6E1;
  --danger: #C0392B;
  --radius: 14px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.10);
}

* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button { font: inherit; cursor: pointer; }
img { max-width: 100%; display: block; }
h1, h2, h3 { line-height: 1.2; margin: 0 0 12px; }

.app { min-height: 100%; display: flex; flex-direction: column; }
.main { flex: 1; width: 100%; max-width: 1200px; margin: 0 auto; padding: 28px 20px 64px; }
.container { width: 100%; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 18px; border-radius: 10px; border: 1px solid var(--border);
  background: var(--surface); color: var(--text); font-weight: 600;
  transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
}
.btn:hover { transform: translateY(-1px); box-shadow: var(--shadow); }
.btn-primary { background: var(--brand); border-color: var(--brand); color: #fff; }
.btn-primary:hover { background: var(--brand-dark); }
.btn:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-block { width: 100%; }

.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow);
}

.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.field label { font-size: 14px; font-weight: 600; }
.field input {
  padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border);
  background: var(--surface); font: inherit; color: var(--text);
}
.field input:focus { outline: 2px solid var(--brand-soft); border-color: var(--brand-soft); }
.error-text { color: var(--danger); font-size: 13px; }
.muted { color: var(--muted); }
.price { font-weight: 700; }
```

- [ ] **Step 4: Buat src/main.jsx sementara**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ padding: 40 }}>Zaa Coffe &amp; eatery — setup ok</div>
  </React.StrictMode>
)
```

- [ ] **Step 5: Install & verifikasi dev server**

Run: `npm install`
Expected: selesai tanpa error, folder `node_modules` muncul.

Run: `npm run build`
Expected: `vite build` sukses, folder `dist` terbentuk, tanpa error.

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold vite react app with theme"
```

---

### Task 2: Data produk & helper format

**Files:**
- Create: `src/data/products.js`, `src/lib/format.js`

**Interfaces:**
- Produces:
  - `products`: `Array<{ id: string, name: string, category: 'Kopi'|'Non-Kopi'|'Makanan'|'Snack', price: number, image: string, emoji: string, description: string, rating: number, tag?: string }>`
  - `formatRupiah(value: number): string` → mis. `22000` → `"Rp22.000"`.
  - `categories`: `['Semua','Kopi','Non-Kopi','Makanan','Snack']`

- [ ] **Step 1: Buat src/lib/format.js**

```js
export function formatRupiah(value) {
  return 'Rp' + Number(value).toLocaleString('id-ID')
}
```

- [ ] **Step 2: Buat src/data/products.js**

```js
export const categories = ['Semua', 'Kopi', 'Non-Kopi', 'Makanan', 'Snack']

export const products = [
  {
    id: 'es-kopi-susu',
    name: 'Es Kopi Susu Gula Aren',
    category: 'Kopi',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&q=80',
    emoji: '🧋',
    description: 'Espresso, susu segar, dan gula aren cair. Manis lembut, disajikan dingin.',
    rating: 4.8,
    tag: 'Favorit',
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino Klasik',
    category: 'Kopi',
    price: 26000,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    emoji: '☕',
    description: 'Espresso dengan busa susu tebal dan taburan bubuk kakao.',
    rating: 4.7,
  },
  {
    id: 'americano',
    name: 'Americano Panas',
    category: 'Kopi',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
    emoji: '☕',
    description: 'Espresso murni dengan air panas. Pahit bersih tanpa gula.',
    rating: 4.5,
  },
  {
    id: 'latte-caramel',
    name: 'Caramel Latte',
    category: 'Kopi',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80',
    emoji: '🥤',
    description: 'Latte lembut dengan saus karamel dan whipped cream.',
    rating: 4.6,
    tag: 'Baru',
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    category: 'Non-Kopi',
    price: 27000,
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80',
    emoji: '🍵',
    description: 'Matcha Jepang premium dengan susu segar.',
    rating: 4.7,
    tag: 'Favorit',
  },
  {
    id: 'chocolate',
    name: 'Cokelat Panas',
    category: 'Non-Kopi',
    price: 24000,
    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&q=80',
    emoji: '🍫',
    description: 'Cokelat pekat dengan susu, hangat dan menenangkan.',
    rating: 4.4,
  },
  {
    id: 'lemon-tea',
    name: 'Es Lemon Tea',
    category: 'Non-Kopi',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=800&q=80',
    emoji: '🍋',
    description: 'Teh hitam dingin dengan perasan lemon segar.',
    rating: 4.3,
  },
  {
    id: 'orange-juice',
    name: 'Jus Jeruk Segar',
    category: 'Non-Kopi',
    price: 21000,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80',
    emoji: '🍊',
    description: 'Jeruk peras murni tanpa gula tambahan.',
    rating: 4.6,
  },
  {
    id: 'croissant',
    name: 'Croissant Butter',
    category: 'Makanan',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
    emoji: '🥐',
    description: 'Croissant panggang berlapis dengan butter premium.',
    rating: 4.8,
    tag: 'Favorit',
  },
  {
    id: 'club-sandwich',
    name: 'Club Sandwich',
    category: 'Makanan',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
    emoji: '🥪',
    description: 'Roti panggang isi ayam, telur, selada, dan tomat.',
    rating: 4.7,
  },
  {
    id: 'beef-burger',
    name: 'Beef Burger',
    category: 'Makanan',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    emoji: '🍔',
    description: 'Patty sapi, keju leleh, dan saus spesial dalam roti brioche.',
    rating: 4.9,
    tag: 'Favorit',
  },
  {
    id: 'pancake',
    name: 'Pancake Madu',
    category: 'Makanan',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80',
    emoji: '🥞',
    description: 'Tumpukan pancake lembut dengan madu dan mentega.',
    rating: 4.5,
  },
  {
    id: 'french-fries',
    name: 'French Fries',
    category: 'Snack',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
    emoji: '🍟',
    description: 'Kentang goreng renyah dengan saus mayo.',
    rating: 4.4,
  },
  {
    id: 'donut',
    name: 'Donat Gula',
    category: 'Snack',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
    emoji: '🍩',
    description: 'Donat lembut berlumur gula halus.',
    rating: 4.6,
  },
  {
    id: 'cookies',
    name: 'Cookies Cokelat',
    category: 'Snack',
    price: 17000,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80',
    emoji: '🍪',
    description: 'Kue kering dengan potongan cokelat melimpah.',
    rating: 4.5,
  },
  {
    id: 'cheesecake',
    name: 'Cheesecake Slice',
    category: 'Snack',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1533134242453-e9d9b9b3a5a1?w=800&q=80',
    emoji: '🍰',
    description: 'Cheesecake panggang dengan saus berry.',
    rating: 4.7,
    tag: 'Baru',
  },
]
```

- [ ] **Step 3: Commit**

```bash
git add src/data/products.js src/lib/format.js
git commit -m "feat: add product catalog data and currency helper"
```

---

### Task 3: CartContext (state keranjang)

**Files:**
- Create: `src/context/CartContext.jsx`

**Interfaces:**
- Consumes: `products` dari `src/data/products.js`.
- Produces (via `useCart()`):
  - `items: Array<{ productId: string, qty: number }>`
  - `addItem(productId: string, qty?: number): void` (default `qty = 1`)
  - `removeItem(productId: string): void`
  - `setQty(productId: string, qty: number): void` (qty < 1 → hapus item)
  - `clearCart(): void`
  - `count: number` (total qty)
  - `subtotal: number` (total harga)
  - `detailedItems: Array<{ product: object, qty: number, lineTotal: number }>`

- [ ] **Step 1: Buat src/context/CartContext.jsx**

```jsx
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
```

- [ ] **Step 2: Verifikasi build**

Run: `npm run build`
Expected: sukses tanpa error.

- [ ] **Step 3: Commit**

```bash
git add src/context/CartContext.jsx
git commit -m "feat: add cart context with localStorage persistence"
```

---

### Task 4: AuthContext (login/daftar/logout simulasi)

**Files:**
- Create: `src/context/AuthContext.jsx`

**Interfaces:**
- Produces (via `useAuth()`):
  - `user: { name: string, email: string } | null`
  - `register(name: string, email: string, password: string): { ok: boolean, error?: string }`
  - `login(email: string, password: string): { ok: boolean, error?: string }`
  - `logout(): void`
- Storage: `zaa_users` = `Array<{name,email,password}>`; `zaa_user` = sesi aktif `{name,email}`.

- [ ] **Step 1: Buat src/context/AuthContext.jsx**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const USERS_KEY = 'zaa_users'
const SESSION_KEY = 'zaa_user'

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function loadUsers() {
  const users = safeParse(USERS_KEY, [])
  return Array.isArray(users) ? users : []
}

function loadSession() {
  const u = safeParse(SESSION_KEY, null)
  return u && typeof u.email === 'string' ? u : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession)

  useEffect(() => {
    try {
      if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore storage errors */
    }
  }, [user])

  function register(name, email, password) {
    const cleanName = (name || '').trim()
    const cleanEmail = (email || '').trim().toLowerCase()
    if (!cleanName) return { ok: false, error: 'Nama wajib diisi.' }
    if (!cleanEmail) return { ok: false, error: 'Email wajib diisi.' }
    if (!password || password.length < 6)
      return { ok: false, error: 'Password minimal 6 karakter.' }

    const users = loadUsers()
    if (users.some((u) => u.email === cleanEmail))
      return { ok: false, error: 'Email sudah terdaftar.' }

    const newUser = { name: cleanName, email: cleanEmail, password }
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
    } catch {
      return { ok: false, error: 'Gagal menyimpan data.' }
    }
    setUser({ name: cleanName, email: cleanEmail })
    return { ok: true }
  }

  function login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase()
    if (!cleanEmail) return { ok: false, error: 'Email wajib diisi.' }
    if (!password) return { ok: false, error: 'Password wajib diisi.' }

    const users = loadUsers()
    const found = users.find(
      (u) => u.email === cleanEmail && u.password === password
    )
    if (!found) return { ok: false, error: 'Email atau password salah.' }

    setUser({ name: found.name, email: found.email })
    return { ok: true }
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Verifikasi build**

Run: `npm run build`
Expected: sukses.

- [ ] **Step 3: Commit**

```bash
git add src/context/AuthContext.jsx
git commit -m "feat: add auth context with simulated login"
```

---

### Task 5: Komponen bersama (Navbar, Footer, ProductCard, QuantityStepper, ProtectedRoute, EmptyState)

**Files:**
- Create: `src/components/Navbar.jsx`, `src/components/Footer.jsx`, `src/components/ProductCard.jsx`, `src/components/QuantityStepper.jsx`, `src/components/ProtectedRoute.jsx`, `src/components/EmptyState.jsx`, `src/components/components.css`

**Interfaces:**
- Consumes: `useCart()` (`count`), `useAuth()` (`user`, `logout`), `formatRupiah`, `Link`/`NavLink`/`Navigate` dari `react-router-dom`.
- Produces:
  - `<Navbar />`, `<Footer />`
  - `<ProductCard product={object} />`
  - `<QuantityStepper value={number} onChange={(n)=>void} min={number=1} max={number=99} />`
  - `<ProtectedRoute>{children}</ProtectedRoute>` (redirect ke `/login` bila belum login)
  - `<EmptyState title message actionLabel actionTo />`

- [ ] **Step 1: Buat src/components/QuantityStepper.jsx**

```jsx
export default function QuantityStepper({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Kurangi"
      >
        −
      </button>
      <span className="stepper-value">{value}</span>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Tambah"
      >
        +
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Buat src/components/ProductCard.jsx**

```jsx
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
```

- [ ] **Step 3: Buat src/components/EmptyState.jsx**

```jsx
import { Link } from 'react-router-dom'

export default function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="empty-state card">
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Buat src/components/ProtectedRoute.jsx**

```jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}
```

- [ ] **Step 5: Buat src/components/Navbar.jsx**

```jsx
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { count } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">Z</span>
          <span className="brand-text">Zaa Coffe &amp; eatery</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Menu
          </NavLink>
          <NavLink to="/keranjang">
            Keranjang
            {count > 0 && <span className="cart-badge">{count}</span>}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/akun">Akun</NavLink>
              <button type="button" className="link-btn" onClick={handleLogout}>
                Keluar
              </button>
            </>
          ) : (
            <NavLink to="/login">Masuk</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 6: Buat src/components/Footer.jsx**

```jsx
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-brand">Zaa Coffe &amp; eatery</p>
        <p className="muted">Kopi, makanan, dan camilan — dibuat dengan ♥</p>
        <p className="muted small">© {new Date().getFullYear()} Zaa Coffe &amp; eatery</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 7: Buat src/components/components.css**

```css
/* Navbar */
.navbar {
  position: sticky; top: 0; z-index: 20;
  background: rgba(250, 250, 248, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.navbar-inner {
  max-width: 1200px; margin: 0 auto; padding: 14px 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; }
.brand-mark {
  width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
  background: var(--brand); color: #fff; font-weight: 800;
}
.brand-text { font-size: 16px; }
.nav-links { display: flex; align-items: center; gap: 18px; font-weight: 600; font-size: 14px; }
.nav-links a { padding: 6px 2px; border-bottom: 2px solid transparent; position: relative; }
.nav-links a:hover { color: var(--brand); }
.nav-links a.active { color: var(--brand); border-bottom-color: var(--brand); }
.cart-badge {
  display: inline-grid; place-items: center; min-width: 18px; height: 18px;
  padding: 0 4px; margin-left: 6px; border-radius: 9px;
  background: var(--brand); color: #fff; font-size: 11px; font-weight: 700;
}
.link-btn { background: none; border: none; padding: 0; color: inherit; font-weight: 600; }
.link-btn:hover { color: var(--brand); }

/* Footer */
.footer { border-top: 1px solid var(--border); background: var(--surface); }
.footer-inner { max-width: 1200px; margin: 0 auto; padding: 28px 20px; text-align: center; }
.footer-brand { font-weight: 700; margin: 0 0 6px; }
.footer .small { font-size: 12px; }
.footer p { margin: 4px 0; }

/* Product card */
.product-card { overflow: hidden; display: flex; flex-direction: column; transition: transform .18s ease, box-shadow .18s ease; }
.product-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.product-thumb { position: relative; aspect-ratio: 1 / 1; background: #F1EEE8; overflow: hidden; }
.product-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease; }
.product-card:hover .product-thumb img { transform: scale(1.04); }
.thumb-fallback { display: grid; place-items: center; font-size: 56px; }
.thumb-fallback::after { content: attr(data-emoji); }
.badge {
  position: absolute; top: 10px; left: 10px;
  background: var(--brand); color: #fff; font-size: 11px; font-weight: 700;
  padding: 4px 10px; border-radius: 20px;
}
.product-body { padding: 14px 16px 18px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
.product-cat { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
.product-name { font-size: 15px; margin: 0; }
.product-foot { margin-top: auto; padding-top: 10px; display: flex; align-items: center; justify-content: space-between; }
.rating { font-size: 13px; color: var(--muted); }

/* Stepper */
.stepper { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.stepper-btn { width: 34px; height: 34px; border: none; background: var(--surface); font-size: 18px; color: var(--text); }
.stepper-btn:hover:not(:disabled) { background: #F3F0EA; }
.stepper-btn:disabled { opacity: .4; cursor: not-allowed; }
.stepper-value { min-width: 36px; text-align: center; font-weight: 600; }

/* Empty state */
.empty-state { padding: 48px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
```

- [ ] **Step 8: Import CSS global & verifikasi build**

Di `src/main.jsx`, tambahkan `import './components/components.css'` setelah `import './index.css'`. Isi `main.jsx` jadi:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './components/components.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ padding: 40 }}>Zaa Coffe &amp; eatery — setup ok</div>
  </React.StrictMode>
)
```

Run: `npm run build`
Expected: sukses.

- [ ] **Step 9: Commit**

```bash
git add src/components
git commit -m "feat: add shared UI components"
```

---

### Task 6: Halaman Katalog (Home)

**Files:**
- Create: `src/pages/Home.jsx`, `src/pages/pages.css`

**Interfaces:**
- Consumes: `products`, `categories`, `<ProductCard />`, `<EmptyState />`, `formatRupiah`.
- Produces: `<Home />` merender hero, kontrol filter/pencarian/urut, dan grid produk. `src/pages/pages.css` menyediakan `.hero`, `.filters`, `.chip`, `.grid`, `.auth-card`, `.cart-layout`, `.detail`, `.notfound`.

- [ ] **Step 1: Buat src/pages/pages.css**

```css
/* Section heading */
.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin: 28px 0 16px; }
.section-head h2 { margin: 0; font-size: 22px; }

/* Hero */
.hero {
  background: linear-gradient(135deg, #6F4E37 0%, #8A6249 60%, #C8A27A 100%);
  color: #fff; border-radius: 20px; padding: 48px 36px; margin-bottom: 8px;
  box-shadow: var(--shadow-lg);
}
.hero h1 { font-size: clamp(28px, 4vw, 44px); margin: 0 0 10px; }
.hero p { max-width: 560px; margin: 0 0 22px; opacity: .92; }
.hero .btn { background: #fff; color: var(--brand); border-color: #fff; }

/* Filters */
.filters { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 20px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  padding: 7px 14px; border-radius: 20px; border: 1px solid var(--border);
  background: var(--surface); font-weight: 600; font-size: 13px; color: var(--muted);
}
.chip:hover { border-color: var(--brand-soft); color: var(--brand); }
.chip.active { background: var(--brand); border-color: var(--brand); color: #fff; }
.filters-right { display: flex; gap: 10px; margin-left: auto; }
.search-input, .select {
  padding: 9px 12px; border-radius: 10px; border: 1px solid var(--border);
  background: var(--surface); font: inherit; color: var(--text);
}
.search-input { min-width: 200px; }

/* Grid */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }

/* Product detail */
.detail { display: grid; grid-template-columns: 1.1fr 1fr; gap: 36px; align-items: start; }
.detail-media { border-radius: 18px; overflow: hidden; background: #F1EEE8; aspect-ratio: 1 / 1; }
.detail-media img { width: 100%; height: 100%; object-fit: cover; }
.detail-media.thumb-fallback { display: grid; place-items: center; font-size: 120px; }
.detail-media.thumb-fallback::after { content: attr(data-emoji); }
.detail-info { display: flex; flex-direction: column; gap: 14px; }
.detail-info h1 { font-size: clamp(24px, 3vw, 34px); margin: 0; }
.detail-price { font-size: 26px; font-weight: 800; color: var(--brand); }
.detail-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 6px; }
.detail-desc { color: var(--muted); }
.detail-meta { display: flex; gap: 14px; font-size: 14px; color: var(--muted); }
.crumb { display: inline-block; margin-bottom: 18px; font-size: 14px; color: var(--muted); font-weight: 600; }
.crumb:hover { color: var(--brand); }
.toast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); background: var(--text); color: #fff; padding: 12px 20px; border-radius: 12px; box-shadow: var(--shadow-lg); z-index: 40; }

/* Cart */
.cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }
.cart-list { display: flex; flex-direction: column; gap: 14px; }
.cart-row { display: grid; grid-template-columns: 84px 1fr auto; gap: 16px; align-items: center; padding: 14px; }
.cart-thumb { width: 84px; height: 84px; border-radius: 12px; overflow: hidden; background: #F1EEE8; flex: none; }
.cart-thumb img { width: 100%; height: 100%; object-fit: cover; }
.cart-thumb.thumb-fallback { display: grid; place-items: center; font-size: 34px; }
.cart-thumb.thumb-fallback::after { content: attr(data-emoji); }
.cart-row-info h3 { margin: 0 0 4px; font-size: 15px; }
.cart-row-controls { display: flex; align-items: center; gap: 14px; }
.remove-btn { background: none; border: none; color: var(--danger); font-weight: 600; font-size: 13px; }
.cart-summary { padding: 22px; position: sticky; top: 90px; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
.summary-row.total { font-size: 20px; font-weight: 800; border-top: 1px solid var(--border); padding-top: 14px; margin-top: 14px; }
.summary-note { font-size: 12px; color: var(--muted); margin: 10px 0 14px; }

/* Auth */
.auth-wrap { max-width: 420px; margin: 20px auto; }
.auth-card { padding: 32px; }
.auth-card h1 { font-size: 24px; }
.auth-alt { text-align: center; margin-top: 18px; font-size: 14px; color: var(--muted); }
.auth-alt a { color: var(--brand); font-weight: 600; }

/* Account */
.account-card { padding: 28px; max-width: 560px; }
.avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--brand); color: #fff; display: grid; place-items: center; font-size: 26px; font-weight: 700; margin-bottom: 16px; }
.account-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
.account-row:last-of-type { border-bottom: none; }

/* Not found */
.notfound { text-align: center; padding: 80px 20px; }
.notfound .code { font-size: 72px; font-weight: 800; color: var(--brand); margin: 0; }

@media (max-width: 820px) {
  .detail { grid-template-columns: 1fr; gap: 22px; }
  .cart-layout { grid-template-columns: 1fr; }
  .cart-summary { position: static; }
  .filters-right { margin-left: 0; width: 100%; }
  .search-input { flex: 1; min-width: 0; }
  .hero { padding: 34px 24px; }
}
@media (max-width: 520px) {
  .brand-text { display: none; }
  .cart-row { grid-template-columns: 64px 1fr; }
  .cart-thumb { width: 64px; height: 64px; }
  .cart-row-controls { grid-column: 1 / -1; justify-content: space-between; }
}
```

- [ ] **Step 2: Buat src/pages/Home.jsx**

```jsx
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
```

- [ ] **Step 3: Import pages.css & verifikasi**

Di `src/main.jsx`, tambahkan `import './pages/pages.css'` setelah import komponen. Run: `npm run build` → sukses.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.jsx src/pages/pages.css src/main.jsx
git commit -m "feat: add catalog home page"
```

---

### Task 7: Halaman Detail Produk

**Files:**
- Create: `src/pages/ProductDetail.jsx`

**Interfaces:**
- Consumes: `useParams`, `Link`, `products`, `useCart().addItem`, `<QuantityStepper />`, `formatRupiah`.
- Produces: `<ProductDetail />`; bila `id` tidak ditemukan → pesan + tautan kembali.

- [ ] **Step 1: Buat src/pages/ProductDetail.jsx**

```jsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { products } from '../data/products.js'
import { useCart } from '../context/CartContext.jsx'
import { formatRupiah } from '../lib/format.js'
import QuantityStepper from '../components/QuantityStepper.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find((p) => p.id === id)
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [toast, setToast] = useState('')

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
        <div className="detail-media">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement.classList.add('thumb-fallback')
              e.currentTarget.parentElement.dataset.emoji = product.emoji
            }}
          />
        </div>

        <div className="detail-info">
          <span className="product-cat">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="detail-meta">
            <span>★ {product.rating.toFixed(1)}</span>
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

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi build**

Run: `npm run build`
Expected: sukses.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProductDetail.jsx
git commit -m "feat: add product detail page"
```

---

### Task 8: Halaman Keranjang

**Files:**
- Create: `src/pages/Cart.jsx`

**Interfaces:**
- Consumes: `useCart()` (`detailedItems`, `subtotal`, `setQty`, `removeItem`, `count`), `<QuantityStepper />`, `<EmptyState />`, `Link`, `formatRupiah`.
- Produces: `<Cart />`; tombol lanjut ke checkout disabled dengan catatan.

- [ ] **Step 1: Buat src/pages/Cart.jsx**

```jsx
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatRupiah } from '../lib/format.js'
import QuantityStepper from '../components/QuantityStepper.jsx'
import EmptyState from '../components/EmptyState.jsx'

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
          {detailedItems.map(({ product, qty, lineTotal }) => (
            <div key={product.id} className="cart-row card">
              <div className="cart-thumb">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement.classList.add('thumb-fallback')
                    e.currentTarget.parentElement.dataset.emoji = product.emoji
                  }}
                />
              </div>
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
            </div>
          ))}
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
```

- [ ] **Step 2: Verifikasi build**

Run: `npm run build`
Expected: sukses.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Cart.jsx
git commit -m "feat: add cart page"
```

---

### Task 9: Halaman Auth (Login, Daftar, Akun)

**Files:**
- Create: `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/pages/Account.jsx`

**Interfaces:**
- Consumes: `useAuth()` (`user`, `login`, `register`, `logout`), `useNavigate`, `useLocation`, `Link`.
- Produces: `<Login />` (setelah sukses redirect ke `location.state.from` atau `/akun`), `<Register />` (setelah sukses redirect `/akun`), `<Account />`.

- [ ] **Step 1: Buat src/pages/Login.jsx**

```jsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const res = login(email, password)
    if (!res.ok) {
      setError(res.error)
      return
    }
    navigate(location.state?.from || '/akun', { replace: true })
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <form className="card auth-card" onSubmit={handleSubmit}>
          <h1>Masuk</h1>
          <p className="muted">Masuk untuk melihat akunmu.</p>

          {error && <p className="error-text">{error}</p>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Masuk
          </button>

          <p className="auth-alt">
            Belum punya akun? <Link to="/daftar">Daftar di sini</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Buat src/pages/Register.jsx**

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const res = register(name, email, password)
    if (!res.ok) {
      setError(res.error)
      return
    }
    navigate('/akun', { replace: true })
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <form className="card auth-card" onSubmit={handleSubmit}>
          <h1>Buat Akun</h1>
          <p className="muted">Daftar untuk mulai berbelanja.</p>

          {error && <p className="error-text">{error}</p>}

          <div className="field">
            <label htmlFor="name">Nama</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Daftar
          </button>

          <p className="auth-alt">
            Sudah punya akun? <Link to="/login">Masuk</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Buat src/pages/Account.jsx**

```jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="container">
      <div className="section-head"><h2>Akun Saya</h2></div>
      <div className="card account-card">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="account-row">
          <span className="muted">Nama</span>
          <span>{user.name}</span>
        </div>
        <div className="account-row">
          <span className="muted">Email</span>
          <span>{user.email}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Link to="/" className="btn">Lihat Menu</Link>
          <button type="button" className="btn" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verifikasi build**

Run: `npm run build`
Expected: sukses.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login.jsx src/pages/Register.jsx src/pages/Account.jsx
git commit -m "feat: add auth and account pages"
```

---

### Task 10: Halaman 404, wiring App, dan verifikasi akhir

**Files:**
- Create: `src/pages/NotFound.jsx`
- Modify: `src/App.jsx`, `src/main.jsx`

**Interfaces:**
- Consumes: seluruh provider (`CartProvider`, `AuthProvider`), `BrowserRouter`, semua halaman & komponen.
- Produces: aplikasi lengkap dengan routing, Navbar, dan Footer.

- [ ] **Step 1: Buat src/pages/NotFound.jsx**

```jsx
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container">
      <div className="notfound">
        <p className="code">404</p>
        <h2>Halaman tidak ditemukan</h2>
        <p className="muted">Sepertinya kamu tersesat. Yuk kembali ke menu.</p>
        <Link to="/" className="btn btn-primary">Kembali ke menu</Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Buat src/App.jsx**

```jsx
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Account from './pages/Account.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produk/:id" element={<ProductDetail />} />
          <Route path="/keranjang" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<Register />} />
          <Route
            path="/akun"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Finalkan src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import './index.css'
import './components/components.css'
import './pages/pages.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 4: Verifikasi build produksi**

Run: `npm run build`
Expected: sukses, `dist/` terbentuk, tanpa error/warning yang menghentikan.

- [ ] **Step 5: Verifikasi manual di browser**

Run: `npm run dev`
Buka URL yang ditampilkan (biasanya `http://localhost:5173`). Cek:
- Katalog tampil; filter kategori, pencarian, dan urut berfungsi.
- Klik produk → detail; atur qty → "Tambah ke keranjang" → badge navbar bertambah.
- Keranjang: ubah qty, hapus, subtotal benar; refresh halaman → keranjang tetap ada.
- `/daftar` → isi form → diarahkan ke `/akun` dan menampilkan data.
- `/login` dengan akun tadi → sukses; password salah → muncul error.
- Keluar → `/akun` mengarahkan ke `/login`.
- URL ngawur (mis. `/xyz`) → halaman 404.
- Buka console browser → tidak ada error.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/main.jsx src/pages/NotFound.jsx
git commit -m "feat: wire routes and finish app"
```

---

## Self-Review

**Spec coverage:**
- Katalog + filter kategori + pencarian + urut → Task 6.
- Detail produk + qty + tambah keranjang → Task 7.
- Keranjang + ubah qty + hapus + subtotal + tanpa checkout → Task 8.
- Login/daftar/akun simulasi + route terproteksi → Task 4, 9, 5 (ProtectedRoute), 10.
- 404 → Task 10.
- Persistensi localStorage → Task 3 (`zaa_cart`), Task 4 (`zaa_users`, `zaa_user`).
- Tema/visual modern minimal → Task 1 (`index.css`), Task 5 (`components.css`), Task 6 (`pages.css`).
- Error handling (id tidak ada, keranjang kosong, storage gagal, input invalid) → Task 7, 8, 3, 4.
- Fallback gambar (online gagal → emoji) → Task 5, 7, 8.

**Placeholder scan:** Tidak ada TBD/TODO; setiap step memuat kode lengkap.

**Type consistency:** `addItem(productId, qty)`, `setQty(productId, qty)`, `removeItem(productId)`, `formatRupiah(value)`, `useCart()`, `useAuth()`, `register(name,email,password)`, `login(email,password)` konsisten antar task.

**Catatan:** Tanpa test framework otomatis (sesuai spec frontend-only). Verifikasi lewat `npm run build` + checklist browser pada Task 10.
