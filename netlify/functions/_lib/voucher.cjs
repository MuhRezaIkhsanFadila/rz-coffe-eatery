// Hitung diskon voucher — fungsi murni (tanpa DB).
// voucher: baris dari tabel vouchers (snake_case).
// items: [{ product: { id, category, price }, qty, lineTotal }]
function computeDiscount(voucher, items) {
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)

  if (!voucher || voucher.active === false) {
    return { valid: false, discount: 0, eligibleSubtotal: 0, reason: 'Voucher tidak aktif.' }
  }

  const now = Date.now()
  if (voucher.starts_at && now < new Date(voucher.starts_at).getTime()) {
    return { valid: false, discount: 0, eligibleSubtotal: 0, reason: 'Voucher belum berlaku.' }
  }
  if (voucher.expires_at && now > new Date(voucher.expires_at).getTime()) {
    return { valid: false, discount: 0, eligibleSubtotal: 0, reason: 'Voucher sudah kedaluwarsa.' }
  }
  if (
    voucher.usage_limit != null &&
    Number(voucher.used_count || 0) >= Number(voucher.usage_limit)
  ) {
    return { valid: false, discount: 0, eligibleSubtotal: 0, reason: 'Kuota voucher sudah habis.' }
  }

  const eligibleSubtotal = items.reduce((s, i) => {
    const p = i.product
    const match =
      voucher.scope === 'all' ||
      (voucher.scope === 'category' && p.category === voucher.scope_value) ||
      (voucher.scope === 'product' && p.id === voucher.scope_value)
    return match ? s + i.lineTotal : s
  }, 0)

  if (subtotal < Number(voucher.min_spend || 0)) {
    return {
      valid: false,
      discount: 0,
      eligibleSubtotal,
      reason: 'Minimum belanja belum terpenuhi.',
    }
  }

  let discount = 0
  if (voucher.type === 'percent') {
    discount = Math.floor((eligibleSubtotal * Number(voucher.value)) / 100)
    if (voucher.max_discount != null) {
      discount = Math.min(discount, Number(voucher.max_discount))
    }
  } else {
    discount = Math.min(Number(voucher.value), eligibleSubtotal)
  }
  discount = Math.min(discount, subtotal)

  if (discount <= 0) {
    return {
      valid: false,
      discount: 0,
      eligibleSubtotal,
      reason: 'Voucher tidak berlaku untuk item ini.',
    }
  }

  return { valid: true, discount, eligibleSubtotal, reason: null }
}

module.exports = { computeDiscount }
