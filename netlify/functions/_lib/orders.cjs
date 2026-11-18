// Helper murni seputar pesanan: daftar status, perhitungan total, export CSV.
// Tidak menyentuh DB supaya bisa diuji tanpa koneksi.

const ORDER_STATUSES = [
  'pending',
  'paid',
  'processing',
  'ready',
  'completed',
  'expired',
  'cancelled',
]

// Status yang dianggap uang sudah masuk (dipakai untuk laporan pendapatan).
const PAID_STATUSES = ['paid', 'processing', 'ready', 'completed']

// Urutan normal sebuah pesanan berjalan.
const ORDER_FLOW = ['pending', 'paid', 'processing', 'ready', 'completed']

const STATUS_LABEL = {
  pending: 'Menunggu Bayar',
  paid: 'Lunas',
  processing: 'Diproses',
  ready: 'Siap Diambil',
  completed: 'Selesai',
  expired: 'Kedaluwarsa',
  cancelled: 'Dibatalkan',
}

function statusLabel(status) {
  return STATUS_LABEL[status] || String(status || '').toUpperCase()
}

function isPaid(status) {
  return PAID_STATUSES.includes(status)
}

function isFinal(status) {
  return status === 'completed' || status === 'expired' || status === 'cancelled'
}

// Menit sebelum pesanan pending dianggap kedaluwarsa. Default 30 menit.
function expireMinutes(env) {
  const raw = env && env.ORDER_EXPIRE_MINUTES
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 30
}

function sumLineTotals(items) {
  return (items || []).reduce((sum, it) => sum + Number(it.lineTotal || 0), 0)
}

function orderTotal(subtotal, discount) {
  return Math.max(0, Number(subtotal || 0) - Number(discount || 0))
}

function countItems(items) {
  return (items || []).reduce((sum, it) => sum + Number(it.qty || 0), 0)
}

// Bungkus satu sel CSV: kutip bila mengandung koma/kutip/baris baru,
// dan cegah formula injection ala spreadsheet pada sel yang diawali = + - @.
function csvEscape(value) {
  let s = value == null ? '' : String(value)
  if (/^[=+\-@]/.test(s)) s = "'" + s
  if (/[",\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'
  return s
}

function formatCsvDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return String(iso)
  }
}

const CSV_HEADER = [
  'Kode Pesanan',
  'Tanggal',
  'Pelanggan',
  'Email',
  'Status',
  'Jumlah Item',
  'Subtotal',
  'Diskon',
  'Total',
  'Voucher',
  'Metode',
  'Ref QRIS',
  'Dibayar',
  'Catatan',
]

// rows: baris tabel orders (snake_case) + items[] + user_email.
function buildOrdersCsv(rows) {
  const lines = [CSV_HEADER.map(csvEscape).join(',')]
  for (const o of rows || []) {
    lines.push(
      [
        String(o.id || '').slice(0, 8).toUpperCase(),
        formatCsvDate(o.created_at),
        o.customer_name || o.user_name || '',
        o.user_email || '',
        statusLabel(o.status),
        countItems(o.items),
        o.subtotal,
        o.discount,
        o.total,
        o.voucher_code || '',
        o.payment_method || '',
        o.qris_ref || '',
        formatCsvDate(o.paid_at),
        o.note || '',
      ]
        .map(csvEscape)
        .join(',')
    )
  }
  return lines.join('\r\n') + '\r\n'
}

module.exports = {
  ORDER_STATUSES,
  PAID_STATUSES,
  ORDER_FLOW,
  STATUS_LABEL,
  statusLabel,
  isPaid,
  isFinal,
  expireMinutes,
  sumLineTotals,
  orderTotal,
  countItems,
  csvEscape,
  buildOrdersCsv,
  CSV_HEADER,
}
