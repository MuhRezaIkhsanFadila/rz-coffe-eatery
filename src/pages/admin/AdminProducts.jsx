import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { formatRupiah } from '../../lib/format.js'

const CATEGORIES = ['Kopi', 'Non-Kopi', 'Makanan', 'Snack']
const EMPTY = {
  name: '', category: 'Kopi', price: '', emoji: '', image: '',
  description: '', rating: '4.5', tag: '', available: true, sort: '0',
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null) // null=closed, {} = new/edit
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/admin/products')
      setProducts(Array.isArray(res) ? res : res.products || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setEditingId(null)
    setForm({ ...EMPTY })
  }
  function openEdit(p) {
    setEditingId(p.id)
    setForm({
      name: p.name || '', category: p.category || 'Kopi', price: String(p.price ?? ''),
      emoji: p.emoji || '', image: p.image || '', description: p.description || '',
      rating: String(p.rating ?? '4.5'), tag: p.tag || '',
      available: p.available !== false, sort: String(p.sort ?? 0),
    })
  }
  function close() {
    setForm(null)
    setEditingId(null)
    setError('')
  }

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.price) {
      setError('Nama dan harga wajib diisi.')
      return
    }
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      emoji: form.emoji.trim() || null,
      image: form.image.trim() || null,
      description: form.description.trim() || null,
      rating: Number(form.rating) || 4.5,
      tag: form.tag.trim() || null,
      available: !!form.available,
      sort: Number(form.sort) || 0,
    }
    setSaving(true)
    try {
      if (editingId) await api.patch(`/admin/products/${editingId}`, payload)
      else await api.post('/admin/products', payload)
      close()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(p) {
    if (!window.confirm(`Hapus produk "${p.name}"?`)) return
    try {
      await api.del(`/admin/products/${p.id}`)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleAvailable(p) {
    try {
      await api.patch(`/admin/products/${p.id}`, { available: !(p.available !== false) })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="admin-head">
        <h1 className="admin-h1">Kelola Menu</h1>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          + Tambah Produk
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Memuat…</p>
      ) : (
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="admin-prod-name">
                      <span className="admin-prod-emoji">{p.emoji || '🍽'}</span>
                      {p.name}
                    </span>
                  </td>
                  <td>{p.category}</td>
                  <td>{formatRupiah(p.price)}</td>
                  <td>
                    <button
                      type="button"
                      className={`toggle ${p.available !== false ? 'on' : ''}`}
                      onClick={() => toggleAvailable(p)}
                      title="Toggle tersedia"
                    >
                      <span />
                    </button>
                  </td>
                  <td className="admin-row-actions">
                    <button type="button" className="link-btn" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button type="button" className="link-btn danger" onClick={() => remove(p)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div className="admin-modal-backdrop" onClick={close}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>{editingId ? 'Edit Produk' : 'Tambah Produk'}</h3>
              <button type="button" className="link-btn" onClick={close}>✕</button>
            </div>
            <form className="admin-form" onSubmit={save}>
              <div className="field">
                <label>Nama</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div className="admin-form-grid">
                <div className="field">
                  <label>Kategori</label>
                  <select
                    className="select"
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Harga (Rp)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-form-grid">
                <div className="field">
                  <label>Emoji</label>
                  <input value={form.emoji} onChange={(e) => set('emoji', e.target.value)} placeholder="☕" />
                </div>
                <div className="field">
                  <label>Tag</label>
                  <input value={form.tag} onChange={(e) => set('tag', e.target.value)} placeholder="Favorit / Baru" />
                </div>
              </div>
              <div className="field">
                <label>URL Gambar</label>
                <input value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://…" />
              </div>
              <div className="field">
                <label>Deskripsi</label>
                <input value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div className="admin-form-grid">
                <div className="field">
                  <label>Rating</label>
                  <input type="number" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)} />
                </div>
                <div className="field">
                  <label>Urutan</label>
                  <input type="number" value={form.sort} onChange={(e) => set('sort', e.target.value)} />
                </div>
              </div>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => set('available', e.target.checked)}
                />
                Tersedia untuk dijual
              </label>
              {error && <p className="error-text">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="btn" onClick={close}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan…' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
