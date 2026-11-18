# ☕ RZ COFFE & EATERY — Fullstack E-Commerce

Aplikasi pemesanan kopi & makanan dengan **mode user** dan **mode admin**, pembayaran **QRIS (demo)**, serta sistem **voucher/diskon**.

- **Frontend:** React 18 + Vite + React Router + Framer Motion → deploy ke **Netlify**
- **Backend:** Netlify Functions (serverless, folder `netlify/functions`)
- **Database:** **Railway PostgreSQL**
- **Auth:** JWT + bcrypt (login user & admin dipisah by role)

---

## ✨ Fitur

**User**
- Daftar / login, lihat menu, cari & filter, keranjang
- Checkout + **input voucher** (diskon otomatis)
- **Pembayaran QRIS** (QR tergenerate dari payload EMVCo asli — disimulasikan untuk demo)
- Struk/receipt + riwayat pesanan

**Admin** (login terpisah, user biasa TIDAK bisa masuk)
- Dashboard statistik + grafik pendapatan
- Kelola menu (tambah/edit/hapus, atur ketersediaan)
- **Terbitkan voucher/diskon** (persen atau nominal; scope semua / kategori / produk tertentu)
- Kelola pesanan (ubah status)

---

## 🚀 Setup dari Nol

### 1. Siapkan database di Railway
1. Buka [railway.app](https://railway.app) → **New Project** → **Provision PostgreSQL**.
2. Klik service **Postgres** → tab **Variables** → salin **`DATABASE_PUBLIC_URL`** (host-nya `xxxx.proxy.rlwy.net`, **bukan** yang `.internal`).
   > Kalau belum ada, aktifkan dulu **Public Networking** di Settings Postgres.

### 2. Konfigurasi project
```bash
npm install
cp .env.example .env.local
```
Lalu isi `.env.local`:
```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST.proxy.rlwy.net:PORT/railway
DATABASE_SSL=true
JWT_SECRET=string-acak-panjang-bebas
```

### 3. Buat tabel + data awal
```bash
npm run db:init
```
Membuat semua tabel, seed 16 produk, dan 2 voucher contoh (`RZ20`, `KOPI5K`).

### 4. Buat akun admin
```bash
npm run admin:create -- admin@rz.coffe passwordmu "Admin RZ"
```
Login admin nanti di `/admin/login`.

### 5. Jalankan lokal
Karena ada API (Netlify Functions), untuk test lokal lengkap pakai **Netlify CLI**:
```bash
npm i -g netlify-cli
netlify dev
```
`netlify dev` menjalankan frontend + functions sekaligus dan meneruskan `/api/*`. Buka URL yang ditampilkan (biasanya http://localhost:8888).

> `npm run dev` biasa hanya menjalankan frontend (tanpa `/api`), jadi login/order tidak akan jalan. Pakai `netlify dev`.

---

## 🌐 Deploy ke Netlify

1. Push project ini ke GitHub.
2. Netlify → **Add new site → Import an existing project** → pilih repo.
3. Build settings (otomatis terbaca dari `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions: `netlify/functions`
4. **Site settings → Environment variables**, tambahkan:
   - `DATABASE_URL` → public URL Railway
   - `DATABASE_SSL` → `true`
   - `JWT_SECRET` → string acak yang sama
5. **Deploy**.

> `npm run db:init` dan `npm run admin:create` cukup dijalankan **sekali dari komputermu** (pakai `.env.local` yang menunjuk ke DB Railway yang sama). Tidak perlu diulang di Netlify.

Domain gratis: pakai subdomain bawaan `namamu.netlify.app` (HTTPS otomatis). Mau domain custom gratis → GitHub Student Pack (.me) atau subdomain `is-a.dev`.

---

## 🧾 Catatan QRIS (demo)
QR dibuat dari payload **EMVCo QRIS** yang strukturnya valid (termasuk CRC16), tapi **pembayaran disimulasikan** lewat tombol "Simulasikan pembayaran berhasil" — tidak terhubung ke penyedia pembayaran sungguhan. Cocok untuk keperluan tugas/demo.

---

## 🔑 Akun & Voucher Contoh
- **User:** daftar sendiri di `/daftar`
- **Admin:** dibuat via `npm run admin:create`, login di `/admin/login`
- **Voucher:** `RZ20` (diskon 20%, min. belanja Rp50.000) · `KOPI5K` (potongan Rp5.000 khusus Kopi)

---

## 📁 Struktur
```
src/                 Frontend React
  context/           Auth, Products, Cart
  pages/             Halaman user
  pages/admin/       Panel admin
  lib/api.js         Wrapper fetch ke /api
netlify/functions/   Backend API (api.cjs + _lib)
db/schema.sql        Skema + seed PostgreSQL
scripts/             init-db & create-admin
netlify.toml         Config build + redirect
```

## 🛠️ Stack & Endpoint
API base: `/api` — mis. `/api/auth/login`, `/api/auth/admin/login`, `/api/products`, `/api/orders`, `/api/vouchers/validate`, `/api/admin/*`.
