# Zaa Coffe & eatery — Web E-Commerce (Design Spec)

Tanggal: 2026-10-01
Status: Disetujui

## Ringkasan

Web e-commerce frontend-only untuk toko kopi & makanan **Zaa Coffe & eatery**.
Dibangun dengan React + Vite, React Router, dan CSS biasa. Tanpa backend,
tanpa database; seluruh data produk dummy dan state pengguna disimpan di
`localStorage`.

Gaya visual: modern minimal — palet netral, aksen cokelat kopi, tipografi bersih.

## Tujuan & Batasan

- Buka di browser sebagai SPA; perintah `npm install` lalu `npm run dev`.
- Tanpa backend/API/database.
- Data produk statis di file frontend.
- Keranjang & sesi login bertahan setelah refresh (localStorage).

Di luar cakupan: checkout, pembayaran, wishlist, backend.

## Teknologi

- **Build:** Vite + React (JSX).
- **Routing:** `react-router-dom`.
- **State:** React Context API (`CartContext`, `AuthContext`).
- **Styling:** CSS biasa — `src/index.css` (variabel tema & reset) + CSS per
  komponen/halaman.
- **Persistensi:** `localStorage` (key: `zaa_cart`, `zaa_user`, `zaa_users`).
- **Ikon:** inline SVG (tanpa dependensi eksternal).
- **Gambar produk:** URL Unsplash (online). Alternatif offline: placeholder
  gradien/SVG lokal.

## Arsitektur & Struktur File

```
e-com/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx                 # entry, BrowserRouter, provider
   ├─ App.jsx                  # definisi route
   ├─ index.css                # tema, reset, utilitas global
   ├─ data/
   │  └─ products.js           # 12–16 produk dummy
   ├─ context/
   │  ├─ CartContext.jsx       # state keranjang + persist
   │  └─ AuthContext.jsx       # login/daftar/logout + persist
   ├─ components/
   │  ├─ Navbar.jsx            # logo, pencarian, badge keranjang, akun
   │  ├─ Footer.jsx
   │  ├─ ProductCard.jsx
   │  ├─ QuantityStepper.jsx
   │  └─ ProtectedRoute.jsx    # guard route /akun
   └─ pages/
      ├─ Home.jsx              # katalog
      ├─ ProductDetail.jsx
      ├─ Cart.jsx
      ├─ Login.jsx
      ├─ Register.jsx
      ├─ Account.jsx
      └─ NotFound.jsx
```

Prinsip: setiap komponen satu tanggung jawab, komunikasi lewat props/context,
logika state terpusat di context.

## Routing

| Route          | Halaman        | Catatan                          |
|----------------|----------------|----------------------------------|
| `/`            | Home           | Katalog + filter + pencarian     |
| `/produk/:id`  | ProductDetail  | 404 jika id tidak ada            |
| `/keranjang`   | Cart           | Ringkasan tanpa checkout         |
| `/login`       | Login          | Redirect ke `/akun` bila sukses  |
| `/daftar`      | Register       | Simpan user baru ke localStorage |
| `/akun`        | Account        | Dilindungi `ProtectedRoute`      |
| `*`            | NotFound       | Halaman 404                      |

## Data Model

### Produk (`data/products.js`)
```js
{
  id: "kopi-susu-01",
  name: "Es Kopi Susu",
  category: "Kopi",          // Kopi | Non-Kopi | Makanan | Snack
  price: 22000,
  image: "https://...",
  description: "…",
  rating: 4.8,
  tag: "Favorit"             // opsional: Favorit | Baru | Promo
}
```

### Item Keranjang (runtime)
```js
{ productId: "kopi-susu-01", qty: 2 }
```
Subtotal dihitung saat render dari data produk.

### User
```js
{ name: "Budi", email: "budi@mail.com", password: "…" } // password polos, simulasi
```

## Perilaku Fitur

### Katalog (Home)
- Hero ringkas + tagline.
- Filter kategori (Semua / Kopi / Non-Kopi / Makanan / Snack).
- Pencarian berdasarkan nama (case-insensitive).
- Urutkan: termurah, termahal, rating tertinggi.
- Grid kartu produk responsif.

### Detail Produk
- Gambar besar, nama, rating, harga, deskripsi.
- `QuantityStepper` (min 1).
- Tombol "Tambah ke keranjang" — menggabungkan qty bila produk sudah ada.
- Umpan balik singkat (mis. notifikasi/toast sederhana).

### Keranjang
- Daftar item: gambar, nama, harga satuan, stepper qty, hapus.
- Subtotal per baris dan total keseluruhan.
- Tombol "Lanjut" dinonaktifkan dengan keterangan "Checkout belum tersedia".

### Auth (simulasi)
- Register: validasi nama/email/password tidak kosong & email belum terdaftar.
- Login: cocokkan dengan data di `localStorage`.
- Logout: hapus sesi.
- Route `/akun` dilindungi; pengguna belum login diarahkan ke `/login`.

## Desain Visual

- **Palet:** latar `#FAFAF8`, permukaan `#FFFFFF`, teks `#1A1A1A`/`#6B6B6B`,
  aksen cokelat kopi `#6F4E37`, aksen terang `#C8A27A`.
- **Tipografi:** Inter (fallback system-ui), bobot 400/600/700.
- **Komponen:** kartu rounded `12–16px`, shadow tipis (`0 2px 8px rgba(0,0,0,.06)`),
  transisi hover `150ms`.
- **Ikon:** inline SVG konsisten ketebalan garis.
- **Responsif:** mobile-first; grid 1 → 2 → 4 kolom; navbar menyesuaikan layar kecil.

## Penanganan Error

- `id` produk tidak dikenal → halaman/Not Found.
- Keranjang kosong → tampilan kosong dengan tautan ke katalog.
- Input form tidak valid → pesan error inline; tombol submit tetap bisa ditekan
  tetapi menampilkan pesan.
- `localStorage` gagal/parsing error → fallback ke state kosong tanpa crash.

## Kriteria Sukses

1. `npm install && npm run dev` berjalan tanpa error.
2. Semua route berfungsi, navigasi SPA lancar.
3. Tambah ke keranjang, ubah qty, hapus, dan total harga benar.
4. Login/daftar/logout berfungsi dan bertahan setelah refresh.
5. Route `/akun` terproteksi.
6. Tampilan rapi & konsisten di mobile dan desktop.
7. Tidak ada error di console saat penggunaan normal.

## Risiko

- Gambar Unsplash butuh koneksi internet. Mitigasi: sediakan placeholder lokal
  bila pengguna ingin mode offline.
