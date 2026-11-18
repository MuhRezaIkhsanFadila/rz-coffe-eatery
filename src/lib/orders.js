// Label & alur status pesanan, dipakai lintas halaman.
export const STATUS_LABEL = {
  pending: 'Menunggu Bayar',
  paid: 'Lunas',
  processing: 'Diproses',
  ready: 'Siap Diambil',
  completed: 'Selesai',
  expired: 'Kedaluwarsa',
  cancelled: 'Dibatalkan',
}

export const PAID_STATUSES = ['paid', 'processing', 'ready', 'completed']

// Langkah yang ditampilkan di pelacakan pesanan pembeli.
export const ORDER_FLOW = [
  { key: 'pending', label: 'Dibuat' },
  { key: 'paid', label: 'Dibayar' },
  { key: 'processing', label: 'Diproses' },
  { key: 'ready', label: 'Siap' },
  { key: 'completed', label: 'Selesai' },
]

export function statusLabel(status) {
  return STATUS_LABEL[status] || String(status || '').toUpperCase()
}

export function isPaidStatus(status) {
  return PAID_STATUSES.includes(status)
}

export function isFinalStatus(status) {
  return status === 'completed' || status === 'expired' || status === 'cancelled'
}

// Index langkah aktif; status batal/kedaluwarsa tidak masuk alur.
export function flowIndex(status) {
  return ORDER_FLOW.findIndex((s) => s.key === status)
}

export function canCancel(status) {
  return status === 'pending' || status === 'paid'
}
