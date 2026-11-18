import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { formatRupiah } from '../../lib/format.js'

const CATEGORIES = ['Kopi', 'Non-Kopi', 'Makanan', 'Snack']
const EMPTY = {
  code: '', description: '', type: 'percent', value: '',
  scope: 'all', scopeValue: '', minSpend: '', maxDiscount: '',
  usageLimit: '', active: true, startsAt: '', expiresAt: '',
}

function valueLabel(v) {
  return v.type === 'percent' ? `${v.value}%` : formatRupiah(v.value)
}
const SCOPE_LABEL = { all: 'Semua', category: 'Kategori', product: 'Produk' }

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [vs, ps] = await Promise.all([
        api.get('/admin/vouchers'),
        api.get('/admin/products'),
      ])
      setVouchers(Array.isArray(vs) ? vs : vs.vouchers || [])
      setProducts(Array.isArray(ps) ? ps : ps.products || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    if (!form.code.trim() || !form.value) {
      setError('Kode dan nilai wajib diisi.')
      return
    }
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      type: form.type,
      value: Number(form.value),
      scope: form.scope,
      scopeValue: form.scope === 'all' ? null : form.scopeValue || null,
      minSpend: Number(form.minSpend) || 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      active: !!form.active,
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
    }
    setSaving(true)
    try {
      await api.post('/admin/vouchers', payload)
      setForm(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(v) {
    try {
      await api.patch(`/admin/vouchers/${v.id}`, { active: !v.active })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(v) {
    if (!window.confirm(`Hapus voucher "${v.code}"?`)) return
    try {
      await api.del(`/admin/vouchers/${v.id}`)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="admin-head">
        <h1 className="admin-h1">Voucher &amp; Diskon</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setForm({ ...EMPTY })}
        >
          + Terbitkan Voucher
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Memuat…</p>
      ) : vouchers.length === 0 ? (
        <div className="empty-state card">
          <h3>Belum ada voucher</h3>
          <p className="muted">Terbitkan voucher diskon untuk pelanggan.</p>
        </div>
      ) : (
        <div className="voucher-grid">
          {vouchers.map((v) => (
            <div className={`voucher-ticket ${v.active ? '' : 'inactive'}`} key={v.id}>
              <div className="voucher-ticket-main">
                <div className="voucher-value">{valueLabel(v)}</div>
                <div className="voucher-code">{v.code}</div>
                {v.description && <p className="muted small">{v.description}</p>}
                <div className="voucher-tags">
                  <span className="chip-mini">
                    {SCOPE_LABEL[v.scope] || v.scope}
                    {v.scope_value ? `: ${v.scope_value}` : ''}
                  </span>
                  {v.min_spend > 0 && (
                    <span className="chip-mini">min {formatRupiah(v.min_spend)}</span>
                  )}
                  {v.usage_limit != null && (
                    <span className="chip-mini">
                      {v.used_count || 0}/{v.usage_limit} dipakai
                    </span>
                  )}
                </div>
              </div>
              <div className="voucher-ticket-side">
                <button
                  type="button"
                  className={`toggle ${v.active ? 'on' : ''}`}
                  onClick={() => toggleActive(v)}
                  title="Aktif/nonaktif"
                >
                  <span />
                </button>
                <button type="button" className="link-btn danger" onClick={() => remove(v)}>
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="admin-modal-backdrop" onClick={() => setForm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Terbitkan Voucher</h3>
              <button type="button" className="link-btn" onClick={() => setForm(null)}>✕</button>
            </div>
            <form className="admin-form" onSubmit={save}>
              <div className="admin-form-grid">
                <div className="field">
                  <label>Kode</label>
                  <input
                    value={form.code}
                    onChange={(e) => set('code', e.target.value.toUpperCase())}
                    placeholder="RZ20"
                  />
                </div>
                <div className="field">
                  <label>Tipe</label>
                  <select className="select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                    <option value="percent">Persen (%)</option>
                    <option value="amount">Nominal (Rp)</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Deskripsi</label>
                <input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Diskon spesial…" />
              </div>
              <div className="admin-form-grid">
                <div className="field">
                  <label>{form.type === 'percent' ? 'Nilai (%)' : 'Nilai (Rp)'}</label>
                  <input type="number" value={form.value} onChange={(e) => set('value', e.target.value)} />
                </div>
                <div className="field">
                  <label>Maks. Diskon (Rp)</label>
                  <input type="number" value={form.maxDiscount} onChange={(e) => set('maxDiscount', e.target.value)} placeholder="opsional" />
                </div>
              </div>
              <div className="admin-form-grid">
                <div className="field">
                  <label>Berlaku untuk</label>
                  <select className="select" value={form.scope} onChange={(e) => { set('scope', e.target.value); set('scopeValue', '') }}>
                    <option value="all">Semua produk</option>
                    <option value="category">Kategori tertentu</option>
                    <option value="product">Produk tertentu</option>
                  </select>
                </div>
                {form.scope === 'category' && (
                  <div className="field">
                    <label>Kategori</label>
                    <select className="select" value={form.scopeValue} onChange={(e) => set('scopeValue', e.target.value)}>
                      <option value="">Pilih…</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                {form.scope === 'product' && (
                  <div className="field">
                    <label>Produk</label>
                    <select className="select" value={form.scopeValue} onChange={(e) => set('scopeValue', e.target.value)}>
                      <option value="">Pilih…</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="admin-form-grid">
                <div className="field">
                  <label>Min. Belanja (Rp)</label>
                  <input type="number" value={form.minSpend} onChange={(e) => set('minSpend', e.target.value)} placeholder="0" />
                </div>
                <div className="field">
                  <label>Batas Pemakaian</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} placeholder="tanpa batas" />
                </div>
              </div>
              <div className="admin-form-grid">
                <div className="field">
                  <label>Mulai</label>
                  <input type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
                </div>
                <div className="field">
                  <label>Berakhir</label>
                  <input type="datetime-local" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
                </div>
              </div>
              <label className="admin-check">
                <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
                Aktifkan voucher
              </label>
              {error && <p className="error-text">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="btn" onClick={() => setForm(null)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan…' : 'Terbitkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
